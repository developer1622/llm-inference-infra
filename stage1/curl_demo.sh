#!/usr/bin/env bash
set -euo pipefail

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

MODEL="${1:-qwen2.5:0.5b}"
BASE_URL="http://localhost:11434"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  Stage 1: Curl Inference Request & Response Inspection Script  ${NC}"
echo -e "${BLUE}  Model: ${GREEN}${MODEL}${NC} | URL: ${YELLOW}${BASE_URL}${NC}"
echo -e "${BLUE}================================================================${NC}\n"

echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 1: Unary Request to /api/generate (Full response at once)${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "Sending prompt: 'Explain what an LLM token is in one short sentence.'"
echo -e "${CYAN}curl -s -X POST ${BASE_URL}/api/generate \\"
echo -e "  -H 'Content-Type: application/json' \\"
echo -e "  -d '{\"model\": \"${MODEL}\", \"prompt\": \"Explain what an LLM token is in one short sentence.\", \"stream\": false}'${NC}\n"

curl -s -X POST "${BASE_URL}/api/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"prompt\": \"Explain what an LLM token is in one short sentence.\",
    \"stream\": false
  }" | jq '{
    model: .model,
    response: .response,
    prompt_tokens: .prompt_eval_count,
    eval_tokens: .eval_count,
    total_duration_ms: (.total_duration / 1000000 | floor),
    prompt_eval_duration_ms: (.prompt_eval_duration / 1000000 | floor),
    eval_duration_ms: (.eval_duration / 1000000 | floor)
  }'

echo -e "\n${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 2: Streaming Request to /api/chat (NDJSON Line-by-Line)${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "Demonstrates 'Transfer-Encoding: chunked' and incremental token delivery:"
echo -e "${CYAN}curl -N -s -X POST ${BASE_URL}/api/chat ...${NC}\n"

curl -N -s -X POST "${BASE_URL}/api/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Why is streaming important in LLM user experience? One bullet point.\"}],
    \"options\": {\"num_predict\": 35}
  }" | while IFS= read -r line; do
    token=$(echo "$line" | jq -r '.message.content // empty')
    echo -n "$token"
  done
echo -e "\n"

echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 3: OpenAI-compatible SSE Stream to /v1/chat/completions${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "Demonstrates Server-Sent Events (SSE) format: 'data: {...}'"
echo -e "${CYAN}curl -N -s -X POST ${BASE_URL}/v1/chat/completions ...${NC}\n"

# Show first 4 SSE chunks raw so the user can inspect the protocol
echo -e "${CYAN}[Raw SSE Chunks]:${NC}"
curl -N -s -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Say hello in 3 words.\"}],
    \"max_tokens\": 15,
    \"stream\": true
  }" | head -n 12 || true

echo -e "\n${GREEN}✓ All curl inspections completed successfully!${NC}"
