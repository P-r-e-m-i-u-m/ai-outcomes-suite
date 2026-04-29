# Prompt: Cited RAG Answer

Use the retrieved context to answer the user.

## Instructions

- Answer only from the provided context.
- Include citations by source title.
- If context is insufficient, say what is missing.
- Keep the answer concise.
- Add limitations when the domain is legal, financial, medical, compliance, or education outcomes.

## Inputs

- User question:
- Retrieved context:
- Domain:

## Output

```json
{
  "answer": "",
  "citations": [],
  "confidence": 0,
  "limitations": []
}
```

