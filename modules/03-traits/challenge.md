# Implement the contract — E0277

An incident must pass through a generic publisher, but the domain type does not yet satisfy the publisher's contract. Create local `challenge.rs` and `reflection.md` from the templates, then compile it. The initial code should produce **E0277** because `Incident` does not implement `Summary`.

```bash
rustc --explain E0277
```

## Requirements

Edit `challenge.rs` so it compiles and prints exactly:

```text
Incident INC-42: checkout unavailable
```

- Keep `publish` generic and keep its `T: Summary` bound.
- Implement `Summary` for `Incident` and use all three fields.
- Keep `summary` returning an owned `String`.
- Do not print directly from `main`, change `publish` to a concrete type, hardcode the whole output, or use unsafe.
- Explain how the bound protects the body of `publish` in `reflection.md`.

No solution is provided.
