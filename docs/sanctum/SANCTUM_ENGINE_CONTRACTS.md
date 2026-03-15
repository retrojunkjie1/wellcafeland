# Sanctum Engine Payload Contracts

This document defines the official payload structures exchanged between Sanctum engines.

Sanctum engines must exchange typed, predictable payloads.
No engine should invent its own field names or return shapes.

This contract prevents silent system breakage as Sanctum evolves.

---

# 1. System Context Output

Produced by:
Sanctum - System Context

```json
{
  "system_name": "Sanctum",
  "run_id": "",
  "blueprint": "",
  "memory": ""
}
