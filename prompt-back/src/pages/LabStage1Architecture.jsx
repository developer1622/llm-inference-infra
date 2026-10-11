import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

export default function LabStage1Architecture() {
  return (
    <Page tone="green" running="Hands-On Lab · Stage 1 Architecture & Wire Protocols" part="Lab 1">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Stage 1 Architecture"
        title="A Prompt Becomes a Response in Go"
        lead="Inside /home/ramum/model-serving/stage1: A pure Go client built with net/http interacting directly with a local inference engine over raw TCP sockets."
      />

      <Section title="The Three Wire Protocols in Stage 1" color="green">
        <div className="grid3">
          <div className="card tone-blue">
            <b>1. Unary /api/generate</b>
            <p>
              Buffered HTTP request &amp; response. The Go client blocks until token generation finishes. Server
              returns cumulative <code>prompt_eval_duration</code> and <code>eval_duration</code> in nanoseconds.
              TTFT equals total latency (e.g. 2,751 ms).
            </p>
          </div>
          <div className="card tone-yellow">
            <b>2. Streaming NDJSON /api/chat</b>
            <p>
              Employs <code>Transfer-Encoding: chunked</code> with <code>application/x-ndjson</code>. Each newline
              delivers an incremental JSON delta with <code>message.content</code>. Yields instant interactivity
              (TTFT = 641 ms) long before the generation completes.
            </p>
          </div>
          <div className="card tone-green">
            <b>3. OpenAI SSE /v1/chat/completions</b>
            <p>
              Standard Server-Sent Events stream: <code>data: &#123;...&#125;</code> lines terminated by{' '}
              <code>data: [DONE]</code>. Provides drop-in compatibility across OpenAI, vLLM, and LiteLLM gateways
              without client code changes.
            </p>
          </div>
        </div>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Go Client Design (client/client.go)" color="green">
          <Term
            title="go · /home/ramum/model-serving/stage1/client/client.go"
            code={`// Built exclusively with Go's standard net/http library
type OllamaClient struct {
    BaseURL     string
    HTTPClient  *http.Client
    InspectWire bool
}

// StreamChat reads chunked NDJSON line-by-line
func (c *OllamaClient) StreamChat(ctx context.Context, 
    req ChatRequest, onToken func(string)) (*InferenceMetrics, error) {
    
    httpReq, _ := http.NewRequestWithContext(ctx, "POST", url, body)
    httpReq.Header.Set("Accept", "application/x-ndjson")
    
    resp, _ := c.HTTPClient.Do(httpReq)
    defer resp.Body.Close()
    
    scanner := bufio.NewScanner(resp.Body)
    for scanner.Scan() {
        // Parse JSON chunk & measure TTFT on first token
        onToken(chunk.Message.Content)
    }
    return metrics, nil
}`}
          />
          <p className="fine">
            Zero third-party SDK dependencies. The Go client uses a standard <code>bufio.Scanner</code> over the HTTP
            response body pipe, dispatching tokens to stdout immediately as TCP packets arrive.
          </p>
        </Section>

        <Section title="Live Wire Inspection Trace (inspect=true)" color="green">
          <Term
            title="wire capture · stage1-client -inspect=true"
            code={`========== [WIRE: HTTP REQUEST] ==========
POST /api/chat HTTP/1.1
Host: localhost:11434
Accept: application/x-ndjson
Content-Type: application/json

{
  "model": "qwen2.5:0.5b",
  "messages": [{"role": "user", "content": "Explain K8s"}],
  "stream": true
}
===========================================

========== [WIRE: HTTP RESPONSE] ==========
HTTP/1.1 200 OK
Content-Type: application/x-ndjson
Transfer-Encoding: chunked
Date: Sun, 11 Oct 2026 12:12:54 GMT
============================================`}
          />
          <p className="fine">
            Notice how the HTTP layer is standard web infrastructure: no AI magic. The payload is JSON, the headers
            are standard HTTP/1.1, and streaming is ordinary TCP chunked transfer encoding.
          </p>
        </Section>
      </div>

      <Callout title="Engineering Insight" tone="green" className="mt-s">
        By implementing the client with standard <code>net/http</code>, we demystify the interaction. The client
        only sees a streaming HTTP connection. All the complexity of tokenization, KV cache indexing, and matrix
        multiplication is encapsulated behind the serving endpoint.
      </Callout>
    </Page>
  )
}
