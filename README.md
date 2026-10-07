# Óxido — Rust crash course

An adaptive Rust course that bridges from Python, Java, or JavaScript and adjusts explanation depth to the learner's experience and preferred Rust level.

Web course: [lfreirecastello.github.io/oxidando](https://lfreirecastello.github.io/oxidando/)

Teaching reference: [teacher_role.md](teacher_role.md). Rust vocabulary is introduced before it is relied upon, with familiar-language comparisons and runnable checkpoints.

## Course profiles

The GitHub Pages entry screen builds a profile from three browser-only preferences:

- Programming knowledge: Basic, Intermediate, or Advanced
- Bridge language: Python, Java, or JavaScript
- Desired Rust level: Basic, Intermediate, or Advanced

The course uses one canonical Rust curriculum. The profile adapts comparison code, vocabulary pace, and depth rather than maintaining separate copies of the lessons. Preferences are stored in `localStorage` and included as URL parameters so a configured path can be bookmarked; no account or personal data is requested.

## Course map

| Module | Focus | State |
| --- | --- | --- |
| [1 — Foundations and ownership](modules/01-ownership/lesson.md) | Syntax, variables, common methods, functions, ownership, borrowing | Ready; challenge pending |
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

Requires `rustc`; no dependencies or Cargo workspace are needed yet. On a normal installation with a system linker, run from this folder:

```bash
mkdir -p /tmp/oxido-rust
rustc --edition=2024 modules/01-ownership/examples.rs -o /tmp/oxido-rust/examples
/tmp/oxido-rust/examples
rustc --edition=2024 modules/01-ownership/challenge.rs -o /tmp/oxido-rust/challenge
# After fixing the challenge:
/tmp/oxido-rust/challenge
```

The initial challenge is intentionally uncompilable. Compiling course files individually keeps that exercise from blocking the working examples.

In the hosted course workspace, Debian system packages are restricted. Rust's official self-contained target is installed, so use:

```bash
rustc --edition=2024 --target x86_64-unknown-linux-musl -C linker=rust-lld \
  modules/01-ownership/examples.rs -o /tmp/oxido-rust/examples
/tmp/oxido-rust/examples
```
