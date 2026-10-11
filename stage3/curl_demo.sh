#!/usr/bin/env bash
set -euo pipefail

echo "================================================================================"
echo " STAGE 3: KSERVE INFERENCE DEMONSTRATION"
echo "================================================================================"
echo "Target Ingress : http://127.0.0.1:80 (Host: kserve-qwen-kserve-test.127.0.0.1.nip.io)"
echo "Target Gateway : http://127.0.0.1:4000 (Bearer: sk-stage2-lab)"
echo "--------------------------------------------------------------------------------"

echo -e "\n[Demo 1] Direct Ingress - Unary Chat Completion:"
curl -s -X POST http://127.0.0.1:80/v1/chat/completions \
  -H "Host: kserve-qwen-kserve-test.127.0.0.1.nip.io" \
  -H "Content-Type: application/json" \
  -d '{"model":"kserve-qwen","messages":[{"role":"user","content":"What is KServe in 20 words?"}],"stream":false}' \
  | jq .

echo -e "\n[Demo 2] Direct Ingress - Streaming SSE (first 8 chunks):"
curl -N -s -X POST http://127.0.0.1:80/v1/chat/completions \
  -H "Host: kserve-qwen-kserve-test.127.0.0.1.nip.io" \
  -H "Content-Type: application/json" \
  -d '{"model":"kserve-qwen","messages":[{"role":"user","content":"Count 1 to 5."}],"stream":true}' \
  | head -n 8

echo -e "\n[Demo 3] LiteLLM Gateway Route to KServe Endpoint:"
curl -s -X POST http://127.0.0.1:4000/v1/chat/completions \
  -H "Authorization: Bearer sk-stage2-lab" \
  -H "Content-Type: application/json" \
  -d '{"model":"kserve-qwen","messages":[{"role":"user","content":"Explain Kubernetes Services in one sentence."}],"stream":false}' \
  | jq .

echo -e "\n[Demo 4] Direct Ingress - Simulated 503 Overload Failure:"
curl -s -i -X POST http://127.0.0.1:80/v1/chat/completions \
  -H "Host: kserve-qwen-kserve-test.127.0.0.1.nip.io" \
  -H "Content-Type: application/json" \
  -H "X-Simulate-Failure: 503" \
  -d '{"model":"kserve-qwen","messages":[{"role":"user","content":"Fail me"}],"stream":false}' \
  | head -n 12

echo -e "\n[Demo 5] KServe v2 Data Plane Protocol (/v2/models/kserve-qwen/infer):"
curl -s -X POST http://127.0.0.1:80/v2/models/kserve-qwen/infer \
  -H "Host: kserve-qwen-kserve-test.127.0.0.1.nip.io" \
  -H "Content-Type: application/json" \
  -d '{"inputs":[]}' \
  | jq .

echo -e "\n[Demo 6] Prometheus Metric Counters:"
curl -s http://127.0.0.1:80/metrics \
  -H "Host: kserve-qwen-kserve-test.127.0.0.1.nip.io" \
  | grep kserve_
