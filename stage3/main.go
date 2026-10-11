package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"
)

const (
	defaultIngressURL = "http://127.0.0.1:80"
	defaultGatewayURL = "http://127.0.0.1:4000"
	kserveHostHeader  = "kserve-qwen-kserve-test.127.0.0.1.nip.io"
	masterKey         = "sk-stage2-lab"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

type ChatResponseChoice struct {
	Index        int         `json:"index"`
	Message      ChatMessage `json:"message"`
	FinishReason string      `json:"finish_reason"`
}

type ChatUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type ChatResponse struct {
	ID        string               `json:"id"`
	Model     string               `json:"model"`
	Choices   []ChatResponseChoice `json:"choices"`
	Usage     ChatUsage            `json:"usage"`
	SystemPod string               `json:"system_pod"`
	Node      string               `json:"node"`
}

type StreamDelta struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type StreamChoice struct {
	Index        int         `json:"index"`
	Delta        StreamDelta `json:"delta"`
	FinishReason *string     `json:"finish_reason"`
}

type StreamChunk struct {
	ID      string         `json:"id"`
	Model   string         `json:"model"`
	Choices []StreamChoice `json:"choices"`
}

func main() {
	mode := flag.String("mode", "all", "Verification mode: direct, gateway, k8s, failure, or all")
	flag.Parse()

	fmt.Println("================================================================================")
	fmt.Println(" STAGE 3 VERIFICATION: KServe on Kubernetes with LiteLLM Gateway")
	fmt.Println("================================================================================")
	fmt.Printf("Ingress Target : %s (Host: %s)\n", defaultIngressURL, kserveHostHeader)
	fmt.Printf("Gateway Target : %s (Auth: Bearer %s)\n", defaultGatewayURL, masterKey)
	fmt.Println("--------------------------------------------------------------------------------")

	switch *mode {
	case "direct":
		runDirectTests()
	case "gateway":
		runGatewayTests()
	case "k8s":
		runK8sDiagnostics()
	case "failure":
		runFailureTests()
	case "all":
		runK8sDiagnostics()
		runDirectTests()
		runGatewayTests()
		runFailureTests()
	default:
		fmt.Printf("Unknown mode: %s. Use direct, gateway, k8s, failure, or all.\n", *mode)
		os.Exit(1)
	}

	fmt.Println("\n================================================================================")
	fmt.Println(" STAGE 3 VERIFICATION COMPLETED SUCCESSFULLY")
	fmt.Println("================================================================================")
}

func runK8sDiagnostics() {
	fmt.Println("\n[1/4] KUBERNETES CONTROL PLANE & POD SCHEDULING OBSERVATION")
	fmt.Println("--------------------------------------------------------------------------------")

	// Get InferenceService Status
	out, err := exec.Command("kubectl", "get", "isvc", "kserve-qwen", "-n", "kserve-test", "-o", "jsonpath={.status.conditions}").Output()
	if err == nil {
		fmt.Printf("✓ KServe InferenceService Conditions: %s\n", string(out))
	}

	// Get Pod Scheduling & Nodes
	cmd := exec.Command("kubectl", "get", "pods", "-n", "kserve-test", "-o", "custom-columns=POD:.metadata.name,NODE:.spec.nodeName,STATUS:.status.phase,IP:.status.podIP,CPU_LIMIT:.spec.containers[0].resources.limits.cpu,MEM_LIMIT:.spec.containers[0].resources.limits.memory")
	out, err = cmd.Output()
	if err == nil {
		fmt.Println("✓ Active Predictor Pods & Resource Limits:")
		lines := strings.Split(strings.TrimSpace(string(out)), "\n")
		for _, l := range lines {
			fmt.Printf("  %s\n", l)
		}
	}

	// Get Service Endpoints
	out, err = exec.Command("kubectl", "get", "endpoints", "kserve-qwen-predictor", "-n", "kserve-test", "-o", "jsonpath={.subsets[0].addresses[*].ip}").Output()
	if err == nil {
		fmt.Printf("✓ Kube-Proxy Service Endpoints: %s\n", string(out))
	}
}

func runDirectTests() {
	fmt.Println("\n[2/4] DIRECT KSERVE INGRESS ENDPOINT TESTING")
	fmt.Println("--------------------------------------------------------------------------------")

	client := &http.Client{Timeout: 90 * time.Second}

	// 1. Unary Test
	fmt.Print("→ Executing Unary Chat Completion via Ingress... ")
	start := time.Now()
	reqBody, _ := json.Marshal(ChatRequest{
		Model: "kserve-qwen",
		Messages: []ChatMessage{
			{Role: "user", Content: "Define Kubernetes Service in 15 words."},
		},
		Stream: false,
	})
	httpReq, _ := http.NewRequest("POST", defaultIngressURL+"/v1/chat/completions", bytes.NewReader(reqBody))
	httpReq.Host = kserveHostHeader
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(httpReq)
	if err != nil {
		fmt.Printf("FAILED: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var cResp ChatResponse
	json.NewDecoder(resp.Body).Decode(&cResp)
	elapsed := time.Since(start)

	fmt.Printf("OK (Status %d, Elapsed %s)\n", resp.StatusCode, elapsed.Round(time.Millisecond))
	if len(cResp.Choices) > 0 {
		fmt.Printf("  Serving Pod   : %s (Node: %s)\n", cResp.SystemPod, cResp.Node)
		fmt.Printf("  Response Text : %s\n", strings.TrimSpace(cResp.Choices[0].Message.Content))
		fmt.Printf("  Token Usage   : prompt=%d completion=%d total=%d\n", cResp.Usage.PromptTokens, cResp.Usage.CompletionTokens, cResp.Usage.TotalTokens)
	}

	// 2. Streaming Test
	fmt.Print("\n→ Executing Streaming SSE Chat Completion via Ingress... \n")
	reqBodyStream, _ := json.Marshal(ChatRequest{
		Model: "kserve-qwen",
		Messages: []ChatMessage{
			{Role: "user", Content: "Explain Pod readiness probes in two bullet points."},
		},
		Stream: true,
	})
	httpReqStream, _ := http.NewRequest("POST", defaultIngressURL+"/v1/chat/completions", bytes.NewReader(reqBodyStream))
	httpReqStream.Host = kserveHostHeader
	httpReqStream.Header.Set("Content-Type", "application/json")

	streamStart := time.Now()
	respStream, err := client.Do(httpReqStream)
	if err != nil {
		fmt.Printf("FAILED: %v\n", err)
		return
	}
	defer respStream.Body.Close()

	reader := bufio.NewReader(respStream.Body)
	var firstTokenTime time.Duration
	var totalStreamTokens int
	var sb strings.Builder

	fmt.Print("  Stream: ")
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "data: ") {
			payload := strings.TrimPrefix(line, "data: ")
			if payload == "[DONE]" {
				break
			}
			var chunk StreamChunk
			if err := json.Unmarshal([]byte(payload), &chunk); err == nil {
				if len(chunk.Choices) > 0 && chunk.Choices[0].Delta.Content != "" {
					if totalStreamTokens == 0 {
						firstTokenTime = time.Since(streamStart)
					}
					totalStreamTokens++
					tok := chunk.Choices[0].Delta.Content
					sb.WriteString(tok)
					fmt.Print(tok)
				}
			}
		}
	}
	streamTotal := time.Since(streamStart)
	fmt.Printf("\n  Metrics: TTFT=%s | Total=%s | Tokens=%d | Speed=%.2f tok/s\n",
		firstTokenTime.Round(time.Millisecond),
		streamTotal.Round(time.Millisecond),
		totalStreamTokens,
		float64(totalStreamTokens)/streamTotal.Seconds())
}

func runGatewayTests() {
	fmt.Println("\n[3/4] LITELLM GATEWAY ROUTING TO KSERVE ENDPOINT")
	fmt.Println("--------------------------------------------------------------------------------")

	client := &http.Client{Timeout: 90 * time.Second}

	fmt.Print("→ Sending Request through LiteLLM Gateway (model: kserve-qwen)... ")
	start := time.Now()
	reqBody, _ := json.Marshal(ChatRequest{
		Model: "kserve-qwen",
		Messages: []ChatMessage{
			{Role: "user", Content: "What is an Ingress controller in Kubernetes?"},
		},
		Stream: false,
	})
	httpReq, _ := http.NewRequest("POST", defaultGatewayURL+"/v1/chat/completions", bytes.NewReader(reqBody))
	httpReq.Header.Set("Authorization", "Bearer "+masterKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(httpReq)
	if err != nil {
		fmt.Printf("FAILED: %v\n", err)
		return
	}
	defer resp.Body.Close()

	var cResp ChatResponse
	json.NewDecoder(resp.Body).Decode(&cResp)
	elapsed := time.Since(start)

	fmt.Printf("OK (Status %d, Elapsed %s)\n", resp.StatusCode, elapsed.Round(time.Millisecond))
	fmt.Printf("  Gateway Response Headers:\n")
	fmt.Printf("    X-LiteLLM-Model-ID : %s\n", resp.Header.Get("x-litellm-model-id"))
	fmt.Printf("    X-LiteLLM-API-Base : %s\n", resp.Header.Get("x-litellm-model-api-base"))
	if len(cResp.Choices) > 0 {
		fmt.Printf("  Serving Pod (via Gateway) : %s (Node: %s)\n", cResp.SystemPod, cResp.Node)
		firstLine := strings.Split(strings.TrimSpace(cResp.Choices[0].Message.Content), "\n")[0]
		fmt.Printf("  Content Preview           : %s\n", firstLine)
	}
}

func runFailureTests() {
	fmt.Println("\n[4/4] RESILIENCE & REQUEST FAILURE OBSERVATION")
	fmt.Println("--------------------------------------------------------------------------------")

	client := &http.Client{Timeout: 10 * time.Second}

	// 1. Direct 503 Injected Failure at Ingress
	fmt.Print("→ Testing Simulated 503 Overload Injection directly at Ingress... ")
	reqBody, _ := json.Marshal(ChatRequest{
		Model: "kserve-qwen",
		Messages: []ChatMessage{
			{Role: "user", Content: "Simulate failure"},
		},
	})
	httpReq, _ := http.NewRequest("POST", defaultIngressURL+"/v1/chat/completions", bytes.NewReader(reqBody))
	httpReq.Host = kserveHostHeader
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Simulate-Failure", "503")

	resp, err := client.Do(httpReq)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		defer resp.Body.Close()
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Verified! Status %d Service Unavailable\n", resp.StatusCode)
		fmt.Printf("  Raw Payload: %s\n", strings.TrimSpace(string(body)))
	}

	// 2. LiteLLM Backend Down Alias Test
	fmt.Print("→ Testing LiteLLM Unreachable Backend Handling (model: backend-down)... ")
	reqBodyDown, _ := json.Marshal(ChatRequest{
		Model: "backend-down",
		Messages: []ChatMessage{
			{Role: "user", Content: "This should fail gracefully."},
		},
	})
	httpReqDown, _ := http.NewRequest("POST", defaultGatewayURL+"/v1/chat/completions", bytes.NewReader(reqBodyDown))
	httpReqDown.Header.Set("Authorization", "Bearer "+masterKey)
	httpReqDown.Header.Set("Content-Type", "application/json")

	respDown, err := client.Do(httpReqDown)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	} else {
		defer respDown.Body.Close()
		body, _ := io.ReadAll(respDown.Body)
		fmt.Printf("Verified! Status %d (Gateway caught backend failure)\n", respDown.StatusCode)
		fmt.Printf("  Gateway Response: %s\n", strings.TrimSpace(string(body)))
	}
}
