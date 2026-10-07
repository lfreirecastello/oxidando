# Module 1 — Rust foundations and ownership

Goal: read ordinary Rust without guessing, write small programs, use common text and collection methods, and understand why Rust cares about ownership. Work through [examples.rs](examples.rs), then attempt [challenge.md](challenge.md).

You already know at least one programming language. This lesson focuses on what Rust makes explicit: types, mutability, resource ownership, and the permissions attached to references. The web course adapts its bridge examples to Python, Java, or JavaScript; this source lesson uses Python as the default comparison.

## 1. How to read a small Rust program

Start with a complete program:

```rust
fn main() {
    let language = "Rust";
    println!("Hello, {language}!");
}
```

Expected output:

```text
Hello, Rust!
```

New words and symbols:

| Rust | Meaning | Python bridge |
| --- | --- | --- |
| `fn` | Defines a function | `def` |
| `main` | Program entry point | `if __name__ == "__main__":` plays a similar role |
| `let` | Creates a variable binding | Assignment creates a name |
| `println!` | Prints a line; `!` marks a macro | `print(...)` is a function |
| `{name}` | Inserts a value into formatted text | `f"{name}"` |
| `;` | Ends a statement | Usually a newline in Python |
| `{ ... }` | Creates a block and a scope | Indentation creates a block |

A **binding** is a name connected to a value. At first, you can read “binding” as “variable.” Rust uses the more precise word because the name may be immutable and because ownership can move from one binding to another.

> Word you just met — **macro**: code that produces other Rust code before normal compilation. For now, use `println!` like Python's `print`; Module 3 explains why the distinction is useful.

## 2. Variables are immutable unless you say `mut`

Python names can always be reassigned:

```python
count = 10
count = count + 1
```

Rust prevents reassignment by default:

```rust
let count = 10;
// count = count + 1; // E0384: cannot assign twice
```

Add `mut`, short for **mutable**, when changing the value is intentional:

```rust
let mut count = 10;
count += 1;
println!("{count}"); // 11
```

This does not mean Rust values can never change. It means a reader can see which bindings may change without searching the whole program.

### Type inference and annotations

Rust often infers the type:

```rust
let retries = 3;          // inferred integer
let ratio = 0.75;         // inferred floating-point number
let enabled = true;       // bool
let initial = 'R';        // char uses single quotes
let label = "ready";      // &str uses double quotes
```

Add `: Type` when the type is not obvious or when the API contract matters:

```rust
let retries: u32 = 3;
let ratio: f64 = 0.75;
```

Common starter types:

| Rust | Meaning | Python comparison |
| --- | --- | --- |
| `i32`, `i64` | Signed integers with fixed widths | `int`, but bounded |
| `u32`, `usize` | Non-negative integers; `usize` is used for indexes and lengths | `int` |
| `f64` | 64-bit floating point | `float` |
| `bool` | `true` or `false` | `bool` |
| `char` | One Unicode scalar value | A one-character `str` |
| `&str` | Borrowed text view | No exact equivalent; similar to read-only text access |
| `String` | Owned, growable UTF-8 text | Closest to Python `str`, but explicitly owned and mutable |
| `Vec<T>` | Growable sequence containing one type `T` | A typed `list` |

### Shadowing creates a new binding

Repeating `let` creates a new binding with the same name:

```rust
let input = " 42 ";
let input = input.trim();
let input: u32 = input.parse().expect("a number");
println!("{input}"); // 42
```

This is **shadowing**. Unlike mutation, it may change the type. Each `input` is a new value; the later binding hides the earlier one.

Use `const` for a value that is fixed for the whole program and known at compile time:

```rust
const MAX_RETRIES: u32 = 3;
```

Constants require a type and conventionally use `UPPER_SNAKE_CASE`.

## 3. Associated functions, methods, and useful text operations

These two calls use different syntax:

```rust
let mut name = String::from("Acme");
name.push_str(" Labs");
```

- `String::from(...)` is an **associated function**. `::` looks up something attached to the `String` type. Python's nearest visual comparison is `ClassName.factory(...)`.
- `name.push_str(...)` is a **method**. The dot calls behavior on an existing value, just like `name.strip()` in Python.

Useful `String` and `str` methods:

| Method | Result | Important detail |
| --- | --- | --- |
| `text.len()` | Byte length as `usize` | Not a Unicode character count |
| `text.is_empty()` | `bool` | Clearer than comparing length with zero |
| `text.trim()` | Borrowed `&str` without surrounding whitespace | Does not mutate the original |
| `text.to_lowercase()` | New lowercase `String` | Allocates new text |
| `text.push('!')` | Adds one `char` | Requires mutable `String` |
| `text.push_str("...")` | Appends borrowed text | Requires mutable `String` |
| `text.as_str()` | Borrows a `String` as `&str` | No allocation |
| `text.parse::<u32>()` | Attempts conversion | Returns `Result`; Module 2 covers errors properly |

Runnable checkpoint:

```rust
let raw = "  Oxide  ";
let clean = raw.trim().to_lowercase();

let mut message = String::from("Learning ");
message.push_str(&clean);
message.push('!');

println!("{message}");
```

Expected output:

```text
Learning oxide!
```

The `&clean` argument means “borrow `clean` temporarily.” We will make that precise after collections and functions.

## 4. Vectors: Rust's common growable sequence

A vector is written `Vec<T>`, where `T` is the element type:

```rust
let mut scores: Vec<u32> = vec![10, 20];
scores.push(30);

println!("count: {}", scores.len());
println!("first: {:?}", scores.get(0));
println!("last: {:?}", scores.pop());
```

Expected output:

```text
count: 3
first: Some(10)
last: Some(30)
```

`vec![...]` is a convenient macro for creating a vector. The `{:?}` formatter prints a debug representation.

Common methods:

| Method | Meaning | Python bridge |
| --- | --- | --- |
| `items.push(value)` | Append | `items.append(value)` |
| `items.pop()` | Remove the last item, if present | `items.pop()`, but absence is represented safely |
| `items.len()` | Number of elements | `len(items)` |
| `items.is_empty()` | Whether length is zero | `not items` |
| `items.get(index)` | Safe access returning `Option<&T>` | Bounds-checked indexing without an exception |
| `items.iter()` | Borrow each element | `iter(items)` |

`scores[0]` also works, but panics if the index is invalid. `scores.get(0)` forces the caller to acknowledge that an item may be absent. Module 2 introduces `Option` and `Result`.

Iteration looks familiar:

```rust
for score in &scores {
    println!("{score}");
}
```

`&scores` borrows the vector, so the loop can read it without taking ownership.

## 5. Functions, parameters, and expressions

Rust writes parameter and return types explicitly:

```rust
fn add_tax(price: f64, rate: f64) -> f64 {
    price * (1.0 + rate)
}

fn main() {
    let total = add_tax(100.0, 0.19);
    println!("{total:.2}");
}
```

Expected output:

```text
119.00
```

The last line in `add_tax` has no semicolon. That makes it an **expression** whose value is returned. Adding a semicolon would turn it into a statement and discard the value.

Python comparison:

```python
def add_tax(price: float, rate: float) -> float:
    return price * (1.0 + rate)
```

You can also write `return value;` in Rust. The final-expression style is common for short functions.

## 6. Ownership: one value, one cleanup responsibility

Now the central Rust rule has enough context to be useful:

1. Every value has an owner.
2. There is one owner at a time.
3. When the owner leaves scope, the value is dropped.

Python assignment usually creates another name for the same object:

```python
jobs = ["sync"]
alias = jobs
alias.append("report")
print(jobs)  # ["sync", "report"]
```

A Rust `String` assignment transfers ownership:

```rust
let customer = String::from("Acme");
let transferred = customer;
println!("{transferred}");
// println!("{customer}"); // E0382: customer was moved
```

The bytes are not automatically deep-copied. Rust invalidates the old binding so only one binding is responsible for cleanup.

### Move, Copy, and Clone

```rust
let retries: u32 = 3;
let saved = retries; // Copy: both remain usable

let original = String::from("Acme");
let duplicate = original.clone(); // explicit independent buffer
let transferred = original;      // move
```

- Small value types such as `u32` implement `Copy`; assignment duplicates them cheaply.
- Resource-owning types such as `String` normally move.
- `.clone()` explicitly asks the type to duplicate itself. For `String`, this copies the text buffer.

Do not add `.clone()` automatically whenever the compiler reports a move. First ask whether the program really needs two independent owners.

## 7. Borrowing gives temporary access

A **reference** borrows a value without taking ownership. `&` reads as “a reference to.”

```rust
fn byte_count(text: &str) -> usize {
    text.len()
}

let customer = String::from("Acme");
let bytes = byte_count(&customer);
println!("{customer} has {bytes} bytes");
```

`customer` remains usable because the function received temporary shared access.

A mutable reference uses `&mut` and requires a mutable owner:

```rust
fn mark_ready(text: &mut String) {
    text.push_str(" | ready");
}

let mut customer = String::from("Acme");
mark_ready(&mut customer);
println!("{customer}");
```

Expected output:

```text
Acme | ready
```

The practical rule is:

- Any number of shared references `&T`, or
- One exclusive mutable reference `&mut T`,
- But not both while their uses overlap.

This prevents a view into a `String` or `Vec` from being used after a mutation reallocates its buffer.

```rust
let mut customer = String::from("Acme");
let preview = customer.as_str();
customer.push_str(" | ready"); // rejected if preview is used later
println!("{preview}");
```

The compiler follows the reference to its last use. Your challenge is about recognizing and correcting this overlap without copying the text.

## 8. Run the examples

From the repository root in this environment:

```bash
mkdir -p /tmp/oxido-rust
rustc --edition=2024 \
  --target x86_64-unknown-linux-musl \
  -C linker=rust-lld \
  modules/01-ownership/examples.rs \
  -o /tmp/oxido-rust/examples
/tmp/oxido-rust/examples
```

On a normal Rust installation with a system linker, the shorter command in the root README is enough.

## Your exercise

Proceed to [challenge.md](challenge.md). Edit your local `challenge.rs`, then complete your local `reflection.md`. The starting program intentionally produces E0502. No solution is included, and your existing learner files are preserved.
