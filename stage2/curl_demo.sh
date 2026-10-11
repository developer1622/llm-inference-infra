#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

MODEL="${1:-demo-model}"
BASE_URL="${LITELLM_URL:-http://localhost:4000}"
API_KEY="${LITELLM_API_KEY:-sk-stage2-lab}"

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}  Stage 2: LiteLLM gateway request inspection                   ${NC}"
echo -e "${BLUE}  Model: ${GREEN}${MODEL}${NC} | URL: ${YELLOW}${BASE_URL}${NC}"
echo -e "${BLUE}================================================================${NC}\n"

echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 1: Gateway process health (no model call)${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
curl -sf "${BASE_URL}/health/liveliness"
echo -e "\n${GREEN}liveliness ok${NC}\n"

echo -e "${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 2: Authenticated model catalog (routing table)${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
curl -s "${BASE_URL}/v1/models" \
  -H "Authorization: Bearer ${API_KEY}" | jq '{object, models: [.data[].id]}'

echo -e "\n${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 3: Unary /v1/chat/completions through the gateway${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
curl -s -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Explain what an LLM token is in one short sentence.\"}],
    \"max_tokens\": 40,
    \"stream\": false
  }" | jq '{
    id,
    model,
    text: .choices[0].message.content,
    prompt_tokens: .usage.prompt_tokens,
    completion_tokens: .usage.completion_tokens
  }'

echo -e "\n${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 4: Streaming SSE (first events only)${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
curl -N -s -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${MODEL}\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Say hello in 3 words.\"}],
    \"max_tokens\": 16,
    \"stream\": true
  }" | head -n 12 || true

echo -e "\n${YELLOW}----------------------------------------------------------------${NC}"
echo -e "${YELLOW} TEST 5: Missing API key is rejected${NC}"
echo -e "${YELLOW}----------------------------------------------------------------${NC}"
unauth=$(curl -s -w $'\n%{http_code}' \
  -X POST "${BASE_URL}/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"demo-model","messages":[{"role":"user","content":"hi"}]}')
printf 'HTTP %s\n' "${unauth##*$'\n'}"
printf '%s\n' "${unauth%$'\n'*}" | jq -c '.error.message // .'

echo -e "\n${GREEN}✓ Gateway curl inspection finished.${NC}"
