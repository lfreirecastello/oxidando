# Óxido — Rust crash course

A practical course bridging advanced Python, intermediate C#, and C/C++ experience into Rust systems engineering.

Web course: [lfreirecastello.github.io/oxidando](https://lfreirecastello.github.io/oxidando/)

Teaching reference: [teacher_role.md](teacher_role.md). The experienced-engineer requirements in this course take precedence over its beginner-oriented examples.

## Course map

| Module | Focus | State |
| --- | --- | --- |
| [1 — Ownership](modules/01-ownership/lesson.md) | Ownership, moves, Copy, storage, borrowing | Ready; challenge pending |
| 2 — Enums and pattern matching | Option, Result, exhaustive matching, `?` | Upcoming |
| 3 — Traits and generics | Data/behavior separation, bounds, static dispatch | Upcoming |
| 4 — Smart pointers | Box, Rc, Arc, RefCell, Mutex | Upcoming |

We develop and review one module at a time. Each ends with broken Rust code; solutions are withheld until you submit an attempt or explicitly ask for one.

## Working workflow

1. Read the current lesson.
2. Run its working examples.
3. Compile the broken challenge and read the diagnostic.
4. Edit the challenge and write your explanation in its `reflection.md`.
5. Ask Codex to review your progress in this folder.

Reviews inspect your actual files, validate behavior where tooling is available, and update a local progress file that is intentionally excluded from the public repository. Completion requires working code and an accurate explanation, not merely suppressing the compiler error.

## Running Module 1

Learner attempts and reflections are local-only. On a fresh clone, create them from the public templates:

```bash
cp -n modules/01-ownership/challenge.template.rs modules/01-ownership/challenge.rs
cp -n modules/01-ownership/reflection.template.md modules/01-ownership/reflection.md
```

Requires `rustc`; no dependencies or Cargo workspace are needed yet. Then run from this folder:

```bash
mkdir -p /tmp/oxido-rust
rustc --edition=2024 modules/01-ownership/examples.rs -o /tmp/oxido-rust/examples
/tmp/oxido-rust/examples
rustc --edition=2024 modules/01-ownership/challenge.rs -o /tmp/oxido-rust/challenge
# After fixing the challenge:
/tmp/oxido-rust/challenge
```

The initial challenge is intentionally uncompilable. Compiling course files individually keeps that exercise from blocking the working examples.
# oxidando
