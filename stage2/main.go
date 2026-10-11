package main

import (
	"bufio"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"model-serving/stage2/client"
)

func main() {
	baseURL := flag.String("url", "http://localhost:4000", "LiteLLM gateway base URL")
	model := flag.String("model", "demo-model", "Gateway model alias to route (demo-model, qwen, smollm)")
	prompt := flag.String("prompt", "Explain what an API gateway does for LLM requests in three short bullet points.", "Prompt to send")
	stream := flag.Bool("stream", true, "Stream tokens as they arrive")
	inspect := flag.Bool("inspect", true, "Print HTTP request and response headers")
	interactive := flag.Bool("interactive", false, "Multi-turn chat through the gateway")
	apiKey := flag.String("api-key", envOr("LITELLM_API_KEY", "sk-stage2-lab"), "Bearer key checked by LiteLLM")
	maxTokens := flag.Int("max-tokens", 0, "Optional cap on generated tokens (0 means no cap)")
	listModels := flag.Bool("list-models", false, "Print the model aliases the gateway exposes")
	failures := flag.Bool("failures", false, "Run auth, routing, and backend-down checks")
	compare := flag.Bool("compare", false, "Send the same prompt to demo-model and smollm")
	flag.Parse()

	c := client.NewClient(*baseURL, *apiKey, *inspect)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	fmt.Println("\033[1;34m╔═══════════════════════════════════════════════════════════════╗\033[0m")
	fmt.Println("\033[1;34m║     Stage 2: LiteLLM API Gateway                              ║\033[0m")
	fmt.Println("\033[1;34m║     Go client  ->  LiteLLM  ->  Ollama                        ║\033[0m")
	fmt.Println("\033[1;34m╚═══════════════════════════════════════════════════════════════╝\033[0m")
	fmt.Printf("Gateway    : \033[33m%s\033[0m\n", *baseURL)
	fmt.Printf("Model      : \033[32m%s\033[0m\n", *model)
	fmt.Printf("API key    : \033[35m%s\033[0m\n", *apiKey)
	fmt.Printf("Streaming  : \033[36m%v\033[0m\n", *stream)
	fmt.Println()

	if err := c.Healthy(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "\033[31mLiteLLM is not reachable at %s (%v).\033[0m\n", *baseURL, err)
		fmt.Fprintf(os.Stderr, "Start it from this directory with: docker compose up -d\n")
		os.Exit(1)
	}

	switch {
	case *listModels:
		if err := printModels(ctx, c); err != nil {
			fmt.Fprintf(os.Stderr, "\033[31m%v\033[0m\n", err)
			os.Exit(1)
		}
	case *failures:
		if err := runFailures(ctx, c); err != nil {
			fmt.Fprintf(os.Stderr, "\033[31m%v\033[0m\n", err)
			os.Exit(1)
		}
	case *compare:
		if err := runCompare(ctx, c, *prompt, *stream, *maxTokens); err != nil {
			fmt.Fprintf(os.Stderr, "\033[31m%v\033[0m\n", err)
			os.Exit(1)
		}
	case *interactive:
		runInteractive(ctx, c, *model, *stream, *maxTokens)
	default:
		if err := runSingle(ctx, c, *model, *prompt, *stream, *maxTokens); err != nil {
			fmt.Fprintf(os.Stderr, "\n\033[31mError during request: %v\033[0m\n", err)
			os.Exit(1)
		}
	}
}

func envOr(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func printModels(ctx context.Context, c *client.GatewayClient) error {
	list, err := c.ListModels(ctx)
	if err != nil {
		return err
	}
	fmt.Println("\033[1m[Gateway model aliases]\033[0m")
	if len(list.Data) == 0 {
		fmt.Println("(none)")
		return nil
	}
	for _, m := range list.Data {
		owner := m.OwnedBy
		if owner == "" {
			owner = "litellm"
		}
		fmt.Printf("  • \033[32m%s\033[0m  (%s)\n", m.ID, owner)
	}
	fmt.Println("\nThe client asks for an alias. LiteLLM selects the Ollama deployment in config.yaml.")
	return nil
}

func runSingle(ctx context.Context, c *client.GatewayClient, model, prompt string, stream bool, maxTokens int) error {
	fmt.Printf("\033[1m[User Prompt]\033[0m\n%s\n\n", prompt)
	fmt.Println("\033[1m[Model Response]\033[0m")
	text, metrics, err := complete(ctx, c, model, []client.ChatMessage{{Role: "user", Content: prompt}}, stream, maxTokens, func(tok string) {
		fmt.Print(tok)
	})
	if err != nil {
		return err
	}
	if !stream {
		fmt.Println(text)
	} else {
		fmt.Println()
	}
	printMetrics(metrics)
	return nil
}

func runCompare(ctx context.Context, c *client.GatewayClient, prompt string, stream bool, maxTokens int) error {
	for _, model := range []string{"demo-model", "smollm"} {
		fmt.Printf("\n\033[1;34m──────── route: %s ────────\033[0m\n", model)
		if err := runSingle(ctx, c, model, prompt, stream, maxTokens); err != nil {
			return fmt.Errorf("%s: %w", model, err)
		}
	}
	return nil
}

func runInteractive(ctx context.Context, c *client.GatewayClient, model string, stream bool, maxTokens int) {
	fmt.Println("\033[32mInteractive session. Type a prompt and press Enter. Type 'exit' to quit.\033[0m")
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
		if strings.EqualFold(input, "exit") || strings.EqualFold(input, "quit") {
			fmt.Println("Exiting interactive session.")
			return
		}
		history = append(history, client.ChatMessage{Role: "user", Content: input})
		fmt.Print("\n\033[1;32massistant>\033[0m ")

		var reply strings.Builder
		text, metrics, err := complete(ctx, c, model, history, stream, maxTokens, func(tok string) {
			fmt.Print(tok)
			reply.WriteString(tok)
		})
		if err != nil {
			fmt.Fprintf(os.Stderr, "\n\033[31mError: %v\033[0m\n", err)
			history = history[:len(history)-1]
			continue
		}
		if !stream {
			fmt.Println(text)
			reply.WriteString(text)
		} else {
			fmt.Println()
		}
		history = append(history, client.ChatMessage{Role: "assistant", Content: reply.String()})
		printMetrics(metrics)
	}
}

func complete(ctx context.Context, c *client.GatewayClient, model string, messages []client.ChatMessage, stream bool, maxTokens int, onToken func(string)) (string, *client.InferenceMetrics, error) {
	req := client.ChatRequest{
		Model:     model,
		Messages:  messages,
		MaxTokens: maxTokens,
	}
	if stream {
		var b strings.Builder
		metrics, err := c.StreamChat(ctx, req, func(tok string) {
			b.WriteString(tok)
			if onToken != nil {
				onToken(tok)
			}
		})
		return b.String(), metrics, err
	}
	return c.UnaryChat(ctx, req)
}

func runFailures(ctx context.Context, c *client.GatewayClient) error {
	fmt.Println("\033[1m[Failure checks]\033[0m")
	fmt.Println("Each case must be rejected by the gateway. A 2xx response is a failed check.")
	fmt.Println()

	// Wire dumps hide the status summary. Failure checks print one line each.
	saved := c.InspectWire
	c.InspectWire = false
	defer func() { c.InspectWire = saved }()

	type check struct {
		name  string
		key   string
		model string
		want  []int
	}
	// key == "OMIT" sends no Authorization header. Other keys are sent as-is.
	checks := []check{
		{name: "missing API key", key: "OMIT", model: "demo-model", want: []int{401}},
		{name: "rejected API key", key: "sk-not-a-real-key", model: "demo-model", want: []int{401, 403}},
		{name: "unknown model alias", key: c.APIKey, model: "no-such-model", want: []int{400, 404}},
		{name: "backend down", key: c.APIKey, model: "backend-down", want: []int{408, 500, 503}},
	}

	failed := 0
	for _, tc := range checks {
		key := tc.key
		if key == "OMIT" {
			key = ""
		}
		payload, _ := json.Marshal(client.ChatRequest{
			Model: tc.model,
			Messages: []client.ChatMessage{
				{Role: "user", Content: "ping"},
			},
			MaxTokens: 8,
		})
		status, body, _, err := c.DoRaw(ctx, "POST", "/v1/chat/completions", payload, key)
		if err != nil {
			fmt.Printf("  \033[31mFAIL\033[0m  %s  transport error: %v\n", tc.name, err)
			failed++
			continue
		}
		msg := errorMessage(body)
		if !statusAllowed(status, tc.want) {
			fmt.Printf("  \033[31mFAIL\033[0m  %s  HTTP %d (wanted %v) %s\n", tc.name, status, tc.want, msg)
			failed++
			continue
		}
		fmt.Printf("  \033[32mPASS\033[0m  %s  HTTP %d  %s\n", tc.name, status, msg)
	}

	fmt.Println()
	fmt.Println("\033[1m[Success check]\033[0m")
	fmt.Println("The same gateway still routes a valid key to Ollama.")
	text, metrics, err := complete(ctx, c, "demo-model", []client.ChatMessage{{Role: "user", Content: "Say hello in three words."}}, false, 16, nil)
	if err != nil {
		fmt.Printf("  \033[31mFAIL\033[0m  valid request: %v\n", err)
		failed++
	} else {
		fmt.Printf("  \033[32mPASS\033[0m  demo-model returned %q\n", strings.TrimSpace(text))
		printMetrics(metrics)
	}

	if failed > 0 {
		return fmt.Errorf("%d check(s) failed", failed)
	}
	fmt.Println("\033[32mAll gateway checks passed.\033[0m")
	return nil
}

func statusAllowed(status int, want []int) bool {
	for _, code := range want {
		if status == code {
			return true
		}
	}
	return false
}

func errorMessage(body []byte) string {
	var parsed struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
		Message string `json:"message"`
	}
	if err := json.Unmarshal(body, &parsed); err == nil {
		if parsed.Error.Message != "" {
			return oneLine(parsed.Error.Message)
		}
		if parsed.Message != "" {
			return oneLine(parsed.Message)
		}
	}
	return oneLine(string(body))
}

func oneLine(s string) string {
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.Join(strings.Fields(s), " ")
	if len(s) > 180 {
		return s[:180] + "..."
	}
	return s
}

func printMetrics(m *client.InferenceMetrics) {
	if m == nil {
		return
	}
	fmt.Println("\n\033[1;33m─────────────────────── [INFERENCE METRICS] ───────────────────────\033[0m")
	if m.ResolvedModel != "" {
		fmt.Printf("• Routed model               : %s\n", m.ResolvedModel)
	}
	if m.TimeToFirstToken > 0 {
		fmt.Printf("• Time to First Token (TTFT) : \033[1;32m%v\033[0m\n", m.TimeToFirstToken.Round(time.Millisecond))
	}
	fmt.Printf("• Total Request Latency      : \033[1;32m%v\033[0m\n", m.TotalLatency.Round(time.Millisecond))
	if m.PromptTokens > 0 {
		fmt.Printf("• Prompt Tokens              : %d\n", m.PromptTokens)
		if m.PromptTokensPerSec > 0 {
			fmt.Printf("• Prompt Evaluation Speed    : %.1f tokens/sec\n", m.PromptTokensPerSec)
		}
	}
	if m.CompletionTokens > 0 {
		label := "decode"
		if m.EvalDuration > 0 && m.TimeToFirstToken != m.TotalLatency {
			fmt.Printf("• Generated Tokens           : %d tokens (%s: %v)\n", m.CompletionTokens, label, m.EvalDuration.Round(time.Millisecond))
		} else {
			fmt.Printf("• Generated Tokens           : %d tokens\n", m.CompletionTokens)
		}
		if m.TokensPerSecond > 0 {
			fmt.Printf("• Token Generation Speed     : \033[1;36m%.2f tokens/sec\033[0m\n", m.TokensPerSecond)
		}
	}
	if m.TotalTokens > 0 {
		fmt.Printf("• Total Tokens Processed     : %d tokens\n", m.TotalTokens)
	}

	g := m.Gateway
	if g.CallID != "" || g.ModelID != "" || g.APIBase != "" || g.Overhead != "" || len(g.Headers) > 0 {
		fmt.Println("\033[1;33m──────────────────────── [GATEWAY] ────────────────────────────────\033[0m")
		if g.CallID != "" {
			fmt.Printf("• Call ID                    : %s\n", g.CallID)
		}
		if name := g.Headers["x-litellm-model-name"]; name != "" {
			fmt.Printf("• Backend model              : %s\n", name)
		}
		if g.ModelID != "" {
			fmt.Printf("• Deployment ID              : %s\n", g.ModelID)
		}
		if g.APIBase != "" {
			fmt.Printf("• Backend API base           : %s\n", g.APIBase)
		}
		if limit := g.Headers["x-ratelimit-limit-requests"]; limit != "" {
			fmt.Printf("• Rate limit                 : %s remaining of %s requests/min\n", g.Headers["x-ratelimit-remaining-requests"], limit)
		}
		if g.Overhead != "" {
			fmt.Printf("• Gateway overhead           : %s ms\n", g.Overhead)
		}
		if g.ResponseDuration != "" {
			fmt.Printf("• Gateway response duration  : %s ms\n", g.ResponseDuration)
		}
		if g.Retries != "" {
			fmt.Printf("• Attempted retries          : %s\n", g.Retries)
		}
		if g.ResponseCost != "" {
			fmt.Printf("• Response cost              : %s\n", g.ResponseCost)
		}
	}
	fmt.Println("\033[1;33m───────────────────────────────────────────────────────────────────\033[0m")
}
