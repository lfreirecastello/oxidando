# Share ownership safely — E0277

A worker thread must append to a log that the main thread reads after joining. The initial ownership container is only valid within one thread. Create local `challenge.rs` and `reflection.md` from the templates, then compile it. The compiler should produce **E0277**, explaining that `Rc<Mutex<Vec<String>>>` cannot be sent between threads safely.

```bash
rustc --explain E0277
```

## Requirements

Edit `challenge.rs` so it compiles and prints exactly:

```text
Events: ["worker complete"]
```

- Keep a real spawned thread and join it before printing.
- Keep one shared log; both threads must reach the same `Vec<String>`.
- Keep `Mutex` protecting mutation and choose a thread-safe shared owner.
- Do not copy results into a second log, use globals, leak memory, or use unsafe.
- Explain why the original owner is not `Send` and why your replacement is appropriate in `reflection.md`.

No solution is provided.
