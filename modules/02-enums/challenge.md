# Model every state — E0004

A delivery integration gained an in-progress state, but its formatter does not handle that variant. Create local `challenge.rs` and `reflection.md` from the templates, then compile the challenge. The initial code should produce **E0004**: non-exhaustive patterns.

```bash
rustc --explain E0004
```

## Requirements

Edit `challenge.rs` so it compiles and prints exactly:

```text
sending: 40%
```

- Keep all four `Delivery` variants and their associated data.
- Keep `status_text` based on `match`.
- Handle `Sending` explicitly and use its `percent` value.
- Do not use `_`, `..` as a whole fallback, hardcoded output, or unsafe.
- Explain why exhaustiveness helps when a state model changes in `reflection.md`.

No solution is provided.
