# Fight the Borrow Checker — E0502

An integration previews a customer record, then prepares its payload for transmission.

Create your local `challenge.rs` from `challenge.template.rs` if needed, then compile it using the command in the root README. The initial code should produce **E0502**: a mutable borrow conflicts with a live immutable borrow.

```bash
rustc --explain E0502
```

## Requirements

Edit `challenge.rs` so it compiles and prints exactly:

```text
Preview: Acme
Payload: Acme | ready
```

- Keep the preview as a borrowed `&str` from `customer`.
- Print that borrowed preview; do not substitute a hardcoded preview.
- Keep `customer` as the String that is subsequently mutated and printed.
- Do not use clone, to_owned, to_string, another allocated snapshot, or unsafe.
- Explain your reasoning in `reflection.md`.

The goal is to understand where a borrow remains live, not to bypass the ownership model. No solution is provided.
