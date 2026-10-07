# Module 2 — Enums, patterns, and recoverable errors

Goal: model a finite set of states, unpack the data carried by each state, and propagate recoverable failures without exceptions. Work through [examples.rs](examples.rs), then attempt [challenge.md](challenge.md).

The hosted lesson selects Python, Java, or JavaScript comparisons. This source lesson keeps all three bridges together so the design trade-offs remain visible.

## Vocabulary before the code

- An **enum** is one type with a fixed list of allowed forms.
- A **variant** is one allowed form, such as `Queued` or `Sending`.
- A **payload** is data stored inside a variant, such as the percentage inside `Sending { percent: 40 }`.
- A **pattern** describes the shape you expect and gives names to data inside that shape.
- A **match arm** is one `pattern => result` branch.
- **Exhaustive** means every possible variant is handled.
- `T` is a placeholder for a type. Therefore, `Option<T>` means “either a value of type `T` or no value.”

## 1. An enum is a closed set of possibilities

Rust enum variants may carry different data:

```rust
enum Delivery {
    Queued,
    Sending { percent: u8 },
    Delivered(String),
    Failed(String),
}
```

This is closer to a Java sealed hierarchy or a JavaScript/TypeScript discriminated union than to a list of integer constants. Python often models the same idea with dataclasses plus a union. The key Rust property is that `Delivery` is one type and the compiler knows every legal variant.

Construct values with `::`:

```rust
let current = Delivery::Sending { percent: 40 };
```

Read this from left to right: “from the `Delivery` enum, create the `Sending` variant and store `40` in its `percent` field.”

## 2. `match` handles and unpacks every case

```rust
fn describe(delivery: Delivery) -> String {
    match delivery {
        Delivery::Queued => String::from("queued"),
        Delivery::Sending { percent } => format!("sending: {percent}%"),
        Delivery::Delivered(id) => format!("delivered: {id}"),
        Delivery::Failed(reason) => format!("failed: {reason}"),
    }
}
```

A **pattern** describes the shape a value must have and can bind its inner fields. `match` is an expression, so each arm produces the returned `String`. It is also exhaustive: adding a variant forces every relevant match to make a decision.

The `=>` symbol separates the pattern on the left from the result to evaluate on the right. It can be read as “then produce.”

Python's `match`, Java's pattern-aware `switch`, and JavaScript's `switch` can express similar control flow. Rust differs by making missed enum variants a compile error rather than a possible production path.

Use `_` only when all remaining values truly have the same meaning. A wildcard can hide a newly added state from compiler-assisted maintenance.

## 3. `Option<T>` makes absence explicit

`Option<T>` is a standard enum with two variants: `Some(T)` and `None`.

```rust
fn first_service(services: &[String]) -> Option<&str> {
    services.first().map(String::as_str)
}

match first_service(&services) {
    Some(name) => println!("first: {name}"),
    None => println!("no services configured"),
}
```

The bridges are Python `value | None`, Java `Optional<T>`, and JavaScript `undefined` or `null`. Rust does not let ordinary `T` values silently become absent: the possibility is part of the type.

For one interesting case, use `if let`:

```rust
if let Some(name) = services.first() {
    println!("first: {name}");
}
```

Common methods include `.map(...)`, `.and_then(...)`, `.unwrap_or(...)`, and `.ok_or(...)`. Prefer transformations and explicit defaults; `.unwrap()` is appropriate only when a violated invariant should stop the program.

## 4. `Result<T, E>` makes failure part of the API

`Result<T, E>` has `Ok(T)` for success and `Err(E)` for failure:

```rust
fn parse_port(raw: &str) -> Result<u16, std::num::ParseIntError> {
    raw.trim().parse::<u16>()
}
```

Python and Java commonly throw exceptions; JavaScript may throw or reject a Promise. Rust reserves panics for unrecoverable bugs and uses `Result` for expected failures a caller can handle.

```rust
match parse_port("8080") {
    Ok(port) => println!("port: {port}"),
    Err(error) => eprintln!("invalid port: {error}"),
}
```

## 5. `?` propagates an error while preserving its type

Inside a function returning a compatible `Result`, `?` extracts an `Ok` value or returns the `Err` immediately:

```rust
fn endpoint(raw_port: &str) -> Result<String, std::num::ParseIntError> {
    let port = parse_port(raw_port)?;
    Ok(format!("127.0.0.1:{port}"))
}
```

Read `?` as “continue with the success value; otherwise return this failure.” It is not an exception and does not hide the error contract—the function signature still exposes it.

At intermediate depth, design error types around what callers can do. At advanced depth, note that `?` uses conversion through `From`/`Into`, allowing a boundary error type to collect lower-level failures without losing static checking.

## 6. Challenge checkpoint

The challenge intentionally omits one enum variant from a `match`, producing E0004. Do not add a wildcard merely to silence it; make the missing state explicit. See [challenge.md](challenge.md).
