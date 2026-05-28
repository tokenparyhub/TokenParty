#!/bin/bash

PROXY="http://localhost:3456"
TOKEN_ANTHROPIC="tp-CadnSnlo3l-yzKw6"
TOKEN_OPENAI="tp-w5YTxF7QuzE2Nml_"
TOKEN_OPENAI_NATIVE="tp-oROmIV0dKAgjC_wO"

echo "========================================="
echo "  TokenParty Proxy Test"
echo "========================================="
echo ""

# 1. Health check
echo "[1] Health Check"
echo "-----------------------------------------"
curl -s "$PROXY/health" | python3 -m json.tool
echo ""

# 2. List models for each token
echo "[2a] Models for zz-anthropic"
echo "-----------------------------------------"
curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_ANTHROPIC" | python3 -m json.tool
echo ""

echo "[2b] Models for zzc-openai"
echo "-----------------------------------------"
curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_OPENAI" | python3 -m json.tool
echo ""

echo "[2c] Models for zzc-openai-native"
echo "-----------------------------------------"
curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" | python3 -m json.tool
echo ""

# Get first model for each token
MODEL_A=$(curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_ANTHROPIC" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])")
MODEL_O=$(curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_OPENAI" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])")
MODEL_CHAT=$(curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(next((m['id'] for m in d if 'chat' in m['id']), d[0]['id']))")
MODEL_CODEX=$(curl -s "$PROXY/v1/models" -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(next((m['id'] for m in d if 'codex' in m['id']), d[0]['id']))")
echo "[*] Anthropic token model: $MODEL_A"
echo "[*] OpenAI compat model:   $MODEL_O"
echo "[*] OpenAI native chat:    $MODEL_CHAT"
echo "[*] OpenAI native codex:   $MODEL_CODEX"
echo ""

# ==============================
# Non-streaming tests
# ==============================

# 3. OpenAI format → Anthropic provider (protocol conversion)
echo "[3] OpenAI format → Anthropic model (OpenAI→Anthropic conversion)"
echo "-----------------------------------------"
echo "POST /v1/chat/completions  model=$MODEL_A  token=zz-anthropic"
curl -s -w "\n--- HTTP %{http_code} | %{time_total}s ---\n" \
  "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_ANTHROPIC" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_A\",
    \"max_tokens\": 1024,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hello in 10 words or less.\"}
    ]
  }" | head -50
echo ""

# 4. Anthropic format → Anthropic provider (direct, no conversion)
echo "[4] Anthropic format → Anthropic model (direct, no conversion)"
echo "-----------------------------------------"
echo "POST /anthropic/v1/messages  model=$MODEL_A  token=zz-anthropic"
curl -s -w "\n--- HTTP %{http_code} | %{time_total}s ---\n" \
  "$PROXY/anthropic/v1/messages" \
  -H "Authorization: Bearer $TOKEN_ANTHROPIC" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_A\",
    \"max_tokens\": 1024,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"What is 2+2? Answer in one word.\"}
    ]
  }" | head -50
echo ""

# 5. OpenAI format → OpenAI provider (direct, no conversion)
echo "[5] OpenAI format → OpenAI model (direct, no conversion)"
echo "-----------------------------------------"
echo "POST /v1/chat/completions  model=$MODEL_O  token=zzc-openai"
curl -s -w "\n--- HTTP %{http_code} | %{time_total}s ---\n" \
  "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_OPENAI" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_O\",
    \"max_tokens\": 1024,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hello in 10 words or less.\"}
    ]
  }" | head -50
echo ""

# 6. Anthropic format → OpenAI provider (Anthropic→OpenAI conversion)
echo "[6] Anthropic format → OpenAI model (Anthropic→OpenAI conversion)"
echo "-----------------------------------------"
echo "POST /anthropic/v1/messages  model=$MODEL_O  token=zzc-openai"
curl -s -w "\n--- HTTP %{http_code} | %{time_total}s ---\n" \
  "$PROXY/anthropic/v1/messages" \
  -H "Authorization: Bearer $TOKEN_OPENAI" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_O\",
    \"max_tokens\": 1024,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"What is 2+2? Answer in one word.\"}
    ]
  }" | head -50
echo ""

# ==============================
# Streaming tests (SSE)
# ==============================

# 7. Streaming: OpenAI format → Anthropic (SSE conversion)
echo "[7] Streaming: OpenAI format → Anthropic model (SSE conversion)"
echo "-----------------------------------------"
echo "POST /v1/chat/completions  model=$MODEL_A  stream=true"
curl -sN "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_ANTHROPIC" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_A\",
    \"max_tokens\": 1024,
    \"stream\": true,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hi.\"}
    ]
  }" 2>&1 | head -20
echo ""
echo ""

# 8. Streaming: Anthropic format → Anthropic (direct SSE)
echo "[8] Streaming: Anthropic format → Anthropic model (direct SSE)"
echo "-----------------------------------------"
echo "POST /anthropic/v1/messages  model=$MODEL_A  stream=true"
curl -sN "$PROXY/anthropic/v1/messages" \
  -H "Authorization: Bearer $TOKEN_ANTHROPIC" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_A\",
    \"max_tokens\": 1024,
    \"stream\": true,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hi.\"}
    ]
  }" 2>&1 | head -20
echo ""
echo ""

# 9. Streaming: OpenAI format → OpenAI (direct SSE)
echo "[9] Streaming: OpenAI format → OpenAI model (direct SSE)"
echo "-----------------------------------------"
echo "POST /v1/chat/completions  model=$MODEL_O  stream=true"
curl -sN "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_OPENAI" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_O\",
    \"max_tokens\": 1024,
    \"stream\": true,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hi.\"}
    ]
  }" 2>&1 | head -20
echo ""
echo ""

# 10. Streaming: Anthropic format → OpenAI (SSE conversion)
echo "[10] Streaming: Anthropic format → OpenAI model (SSE conversion)"
echo "-----------------------------------------"
echo "POST /anthropic/v1/messages  model=$MODEL_O  stream=true"
curl -sN "$PROXY/anthropic/v1/messages" \
  -H "Authorization: Bearer $TOKEN_OPENAI" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_O\",
    \"max_tokens\": 1024,
    \"stream\": true,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hi.\"}
    ]
  }" 2>&1 | head -20
echo ""
echo ""

# ==============================
# OpenAI Responses API tests
# ==============================

# 11. Responses API: non-streaming (codex model)
echo "[11] Responses API: non-streaming (codex model)"
echo "-----------------------------------------"
echo "POST /v1/responses  model=$MODEL_CODEX"
RESP11=$(curl -s "$PROXY/v1/responses" \
  -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_CODEX\",
    \"input\": \"What is 2+2? Answer briefly.\"
  }")
echo "$RESP11" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(json.dumps({
  'id': d.get('id'),
  'status': d.get('status'),
  'model': d.get('model'),
  'output': [{'type': i.get('type'), 'content': i.get('content')} for i in d.get('output',[])],
  'usage': d.get('usage')
}, indent=2))
" 2>/dev/null || echo "$RESP11"
echo ""

# 12. Responses API: streaming (codex model)
echo "[12] Responses API: streaming (codex model)"
echo "-----------------------------------------"
echo "POST /v1/responses  model=$MODEL_CODEX  stream=true"
curl -sN "$PROXY/v1/responses" \
  -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_CODEX\",
    \"stream\": true,
    \"input\": \"Say hi.\"
  }" 2>&1 | head -20
echo ""
echo ""

# 13. Chat Completions: non-streaming (native OpenAI chat model)
echo "[13] Chat Completions: native OpenAI chat model (non-streaming)"
echo "-----------------------------------------"
echo "POST /v1/chat/completions  model=$MODEL_CHAT"
curl -s -w "\n--- HTTP %{http_code} | %{time_total}s ---\n" \
  "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_CHAT\",
    \"max_tokens\": 256,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"What is 2+2? Answer briefly.\"}
    ]
  }" | head -50
echo ""

# 14. Chat Completions: streaming (native OpenAI chat model)
echo "[14] Chat Completions: native OpenAI chat model (streaming)"
echo "-----------------------------------------"
echo "POST /v1/chat/completions  model=$MODEL_CHAT  stream=true"
curl -sN "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_OPENAI_NATIVE" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_CHAT\",
    \"max_tokens\": 256,
    \"stream\": true,
    \"messages\": [
      {\"role\": \"user\", \"content\": \"Say hi.\"}
    ]
  }" 2>&1 | head -20
echo ""
echo ""

# ==============================
# Error cases
# ==============================

# 15. Invalid model
echo "[15] Invalid Model (should return 400)"
echo "-----------------------------------------"
curl -s "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN_ANTHROPIC" \
  -H "Content-Type: application/json" \
  -d '{"model":"nonexistent-model","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
echo ""
echo ""

# 16. Auth failure
echo "[16] Auth Failure (invalid token)"
echo "-----------------------------------------"
curl -s "$PROXY/v1/chat/completions" \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"model":"test","messages":[{"role":"user","content":"hi"}]}'
echo ""
echo ""

# ==============================
# Dashboard API
# ==============================

# 17. Dashboard API - requests
echo "[17] Dashboard API - Recent Requests"
echo "-----------------------------------------"
curl -s "$PROXY/api/requests?limit=5" | python3 -m json.tool 2>/dev/null || curl -s "$PROXY/api/requests?limit=5"
echo ""

# 18. Dashboard API - stats
echo "[18] Dashboard API - Usage Stats"
echo "-----------------------------------------"
curl -s "$PROXY/api/stats" | python3 -m json.tool 2>/dev/null || curl -s "$PROXY/api/stats"
echo ""

echo "========================================="
echo "  Test Matrix:"
echo ""
echo "  Non-streaming (cross-protocol):"
echo "  [3]  OpenAI fmt   + Anthropic model = conversion"
echo "  [4]  Anthropic fmt + Anthropic model = direct"
echo "  [5]  OpenAI fmt   + OpenAI model    = direct"
echo "  [6]  Anthropic fmt + OpenAI model    = conversion"
echo ""
echo "  Streaming SSE (cross-protocol):"
echo "  [7]  OpenAI fmt   + Anthropic model = SSE conversion"
echo "  [8]  Anthropic fmt + Anthropic model = SSE direct"
echo "  [9]  OpenAI fmt   + OpenAI model    = SSE direct"
echo "  [10] Anthropic fmt + OpenAI model    = SSE conversion"
echo ""
echo "  Responses API (native OpenAI):"
echo "  [11] /v1/responses  codex model  non-streaming"
echo "  [12] /v1/responses  codex model  streaming"
echo ""
echo "  Chat Completions (native OpenAI):"
echo "  [13] /v1/chat/completions  chat model  non-streaming"
echo "  [14] /v1/chat/completions  chat model  streaming"
echo ""
echo "  Error cases:"
echo "  [15] Invalid model (400)"
echo "  [16] Invalid token (401)"
echo "========================================="
