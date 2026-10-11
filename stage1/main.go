package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"model-serving/stage1/client"
)

func main() {
	baseURL := flag.String("url", "http://localhost:11434", "Base URL of Ollama or model server")
	model := flag.String("model", "qwen2.5:0.5b", "Model name to query")
	prompt := flag.String("prompt", "Explain what happens when an LLM receives a prompt in three bullet points.", "Prompt to send")
	stream := flag.Bool("stream", true, "Enable streaming responses")
	endpoint := flag.String("endpoint", "chat", "Endpoint mode: 'chat' (/api/chat), 'generate' (/api/generate), or 'openai' (/v1/chat/completions)")
	inspect := flag.Bool("inspect", true, "Print HTTP wire request and response headers")
	interactive := flag.Bool("interactive", false, "Start interactive multi-turn chat session")
	flag.Parse()

	c := client.NewClient(*baseURL, *inspect)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	fmt.Println("\033[1;34m╔═══════════════════════════════════════════════════════════════╗\033[0m")
	fmt.Println("\033[1;34m║     Stage 1: LLM Inference Request Lifecycle Explorer        ║\033[0m")
	fmt.Println("\033[1;34m║     Client: Go net/http  ->  Server: Ollama (Inference Engine)║\033[0m")
	fmt.Println("\033[1;34m╚═══════════════════════════════════════════════════════════════╝\033[0m")
	fmt.Printf("Server URL : \033[33m%s\033[0m\n", *baseURL)
	fmt.Printf("Model      : \033[32m%s\033[0m\n", *model)
	fmt.Printf("Endpoint   : \033[35m%s\033[0m\n", *endpoint)
	fmt.Printf("Streaming  : \033[36m%v\033[0m\n", *stream)
	fmt.Println()

	if *interactive {
		runInteractive(ctx, c, *model, *endpoint, *stream)
		return
	}

	runSingleRequest(ctx, c, *model, *endpoint, *prompt, *stream)
}

func runSingleRequest(ctx context.Context, c *client.OllamaClient, model, endpoint, prompt string, stream bool) {
	fmt.Printf("\033[1m[User Prompt]\033[0m\n%s\n\n", prompt)
	fmt.Println("\033[1m[Model Response]\033[0m")

	var metrics *client.InferenceMetrics
	var responseText string
	var err error

	switch endpoint {
	case "generate":
		req := client.GenerateRequest{
			Model:  model,
			Prompt: prompt,
		}
		if stream {
			metrics, err = c.StreamGenerate(ctx, req, func(token string) {
				fmt.Print(token)
			})
			fmt.Println()
		} else {
			responseText, metrics, err = c.UnaryGenerate(ctx, req)
			if err == nil {
				fmt.Println(responseText)
			}
		}

	case "chat":
		req := client.ChatRequest{
			Model: model,
			Messages: []client.ChatMessage{
				{Role: "user", Content: prompt},
			},
		}
		if stream {
			metrics, err = c.StreamChat(ctx, req, func(token string) {
				fmt.Print(token)
			})
			fmt.Println()
		} else {
			responseText, metrics, err = c.UnaryChat(ctx, req)
			if err == nil {
				fmt.Println(responseText)
			}
		}

	case "openai":
		req := client.OpenAIChatRequest{
			Model: model,
			Messages: []client.ChatMessage{
				{Role: "user", Content: prompt},
			},
		}
		if stream {
			metrics, err = c.StreamOpenAIChat(ctx, req, func(token string) {
				fmt.Print(token)
			})
			fmt.Println()
		} else {
			responseText, metrics, err = c.UnaryOpenAIChat(ctx, req)
			if err == nil {
				fmt.Println(responseText)
			}
		}

	default:
		fmt.Fprintf(os.Stderr, "Unknown endpoint mode: %s. Use 'chat', 'generate', or 'openai'.\n", endpoint)
		return
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "\n\033[31mError during request: %v\033[0m\n", err)
		return
	}

	printMetrics(metrics)
}

func runInteractive(ctx context.Context, c *client.OllamaClient, model, endpoint string, stream bool) {
	fmt.Println("\033[32mInteractive Chat Session started. Type your prompt and press Enter. (Type 'exit' to quit)\033[0m")
	var history []client.ChatMessage
	scanner := bufio.NewScanner(os.Stdin)

	for {
		fmt.Print("\n\033[1;34myou>\033[0m ")
		if !scanner.Scan() {
			break
		}
		input := strings.TrimSpace(scanner.Text())
		if input == "" {
			continue
		}
		if strings.ToLower(input) == "exit" || strings.ToLower(input) == "quit" {
			fmt.Println("Exiting interactive session.")
			break
		}

		history = append(history, client.ChatMessage{Role: "user", Content: input})

		fmt.Print("\n\033[1;32massistant>\033[0m ")

		var assistantReply strings.Builder
		var metrics *client.InferenceMetrics
		var err error

		if endpoint == "openai" {
			req := client.OpenAIChatRequest{
				Model:    model,
				Messages: history,
			}
			if stream {
				metrics, err = c.StreamOpenAIChat(ctx, req, func(token string) {
					fmt.Print(token)
					assistantReply.WriteString(token)
				})
				fmt.Println()
			} else {
				var text string
				text, metrics, err = c.UnaryOpenAIChat(ctx, req)
				if err == nil {
					fmt.Println(text)
					assistantReply.WriteString(text)
				}
			}
		} else {
			req := client.ChatRequest{
				Model:    model,
				Messages: history,
			}
			if stream {
				metrics, err = c.StreamChat(ctx, req, func(token string) {
					fmt.Print(token)
					assistantReply.WriteString(token)
				})
				fmt.Println()
			} else {
				var text string
				text, metrics, err = c.UnaryChat(ctx, req)
				if err == nil {
					fmt.Println(text)
					assistantReply.WriteString(text)
				}
			}
		}

		if err != nil {
			fmt.Fprintf(os.Stderr, "\n\033[31mError: %v\033[0m\n", err)
			continue
		}

		history = append(history, client.ChatMessage{Role: "assistant", Content: assistantReply.String()})
		printMetrics(metrics)
	}
}

func printMetrics(m *client.InferenceMetrics) {
	if m == nil {
		return
	}
	fmt.Println("\n\033[1;33m─────────────────────── [INFERENCE METRICS] ───────────────────────\033[0m")
	if m.TimeToFirstToken > 0 {
		fmt.Printf("• Time to First Token (TTFT) : \033[1;32m%v\033[0m\n", m.TimeToFirstToken.Round(time.Millisecond))
	}
	fmt.Printf("• Total Request Latency      : \033[1;32m%v\033[0m\n", m.TotalLatency.Round(time.Millisecond))
	if m.PromptTokens > 0 {
		fmt.Printf("• Prompt Tokens              : %d tokens (prefill: %v)\n", m.PromptTokens, m.PromptDuration.Round(time.Millisecond))
		if m.PromptTokensPerSec > 0 {
			fmt.Printf("• Prompt Evaluation Speed    : %.1f tokens/sec\n", m.PromptTokensPerSec)
		}
	}
	if m.CompletionTokens > 0 {
		fmt.Printf("• Generated Tokens           : %d tokens (decode: %v)\n", m.CompletionTokens, m.EvalDuration.Round(time.Millisecond))
		if m.TokensPerSecond > 0 {
			fmt.Printf("• Token Generation Speed     : \033[1;36m%.2f tokens/sec\033[0m\n", m.TokensPerSecond)
		}
	}
	if m.TotalTokens > 0 {
		fmt.Printf("• Total Tokens Processed     : %d tokens\n", m.TotalTokens)
	}
	fmt.Println("\033[1;33m───────────────────────────────────────────────────────────────────\033[0m")
}
