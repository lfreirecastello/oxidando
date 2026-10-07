# Module 1 — Ownership and the Borrow Checker

Goal: reason about who owns a resource, which accesses may overlap, and when its memory remains valid. Read this alongside [examples.rs](examples.rs), then attempt [challenge.md](challenge.md).

## 1. Ownership replaces implicit lifetime management

Rust's three ownership rules:

1. Every value has an owner.
2. There is one owner at a time.
3. When the owner leaves scope, the value is dropped.

Ownership covers memory, files, sockets, and other resources. Module 4 introduces explicit shared ownership through Rc and Arc.

| Familiar mechanism | Rust comparison |
| --- | --- |
| Python references; CPython reference counting and cyclic GC | Ordinary ownership and borrowing need no runtime reference counting |
| C# tracing GC | Compile-time lifetime checks and deterministic resource destruction |
| C++ RAII | RAII with checked moves and borrows in safe Rust |

Python aliases an existing list:

```python
jobs = ["sync"]
alias = jobs
alias.append("report")
print(jobs)  # ["sync", "report"]
```

C# reference-type assignment also aliases:

```csharp
var jobs = new List<string> { "sync" };
var alias = jobs;
alias.Add("report");
Console.WriteLine(jobs.Count); // 2
```

Rust transfers ownership:

```rust
let jobs = vec![String::from("sync")];
let mut transferred = jobs;
transferred.push(String::from("report"));
println!("{transferred:?}");
// println!("{jobs:?}"); // E0382: original binding was moved
```

The source becomes unusable so two owners cannot independently destroy the same allocation. Borrow to access temporarily; clone to create independent data.

Destruction resembles C++ RAII:

```cpp
{
    auto resource = std::make_unique<Resource>();
} // Resource destroyed
```

```rust
{
    let file = std::fs::File::open("/etc/hosts").unwrap();
} // File dropped; handle closed
```

`unwrap()` keeps this example focused on ownership; Module 2 introduces deliberate error handling. Ordinary scope exit drops resources. Process abort does not guarantee destructors run. Python context managers and C# using statements explicitly scope resource cleanup; Rust ownership supplies this behavior for resource-owning values.

## 2. Move versus Copy versus Clone

Rust assignment depends on the type, not whether the source happens to live on the stack.

```rust
let retries: u32 = 3;
let saved = retries; // Copy
println!("{retries} {saved}");

let customer = String::from("Acme");
let transferred = customer; // Move
println!("{transferred}");
// customer is no longer usable
```

C++ std::string assignment commonly copies; moving leaves an existing source object in a valid but unspecified state:

```cpp
std::string original = "Acme";
std::string duplicate = original;
std::string transferred = std::move(original);
```

Rust requires explicit cloning and invalidates the moved binding:

```rust
let original = String::from("Acme");
let duplicate = original.clone(); // Independent buffer
let transferred = original;      // original becomes unusable
```

`Copy` permits implicit duplication. `Clone` provides explicit duplication; its cost and sharing behavior depend on the type. For String, clone copies the buffer contents. Copy types also implement Clone, and types requiring Drop cannot implement Copy.

Python/C# reference assignments usually introduce another reference rather than duplicating object contents. Rust String assignment introduces neither another shared owner nor a deep copy: it transfers ownership.

## 3. Storage and ownership are separate questions

A typical local String has a pointer, length, and capacity; its bytes occupy a heap allocation.

```text
String metadata                   Heap buffer
pointer ------------------------> UTF-8 bytes
length                            "Acme"
capacity
```

Moving it transfers buffer ownership without cloning the bytes or requiring a new heap allocation. Exact machine-level placement and copying depend on optimization.

| Rust type | Storage and behavior | Familiar comparison |
| --- | --- | --- |
| u64 | Inline scalar; Copy | C++ uint64_t; C# ulong value |
| [u8; 32] | Inline fixed array; Copy | C++ fixed array, with value semantics |
| Vec<u64> | Owns contiguous heap elements; moves | C++ vector; C# array element storage |
| String | Owns a UTF-8 heap buffer; moves | C++ string, with different assignment rules |
| &str | Borrowed pointer/length view; Copy | C++ string_view, with checked lifetime |

Unlike a Python list of Python integers, Vec<u64> stores the numeric values contiguously without a separate object per element.

```rust
let literal: &str = "Acme"; // Borrowed static bytes
let owned = String::from("Acme");
let view: &str = owned.as_str(); // Borrowed heap bytes
```

Both views have the same type but different underlying storage lifetimes. References do not inherently imply heap storage, and stack storage does not imply Copy.

## 4. Borrowing expresses API contracts

```rust
fn inspect(payload: &str) -> usize {
    payload.len() // UTF-8 bytes, not character count
}

fn normalize(payload: &mut String) {
    payload.make_ascii_lowercase();
}

fn consume(payload: String) {
    println!("Sending: {payload}");
} // Function's owned payload is dropped

fn main() {
    let mut payload = String::from("CUSTOMER CREATED");
    let bytes = inspect(&payload);
    normalize(&mut payload);
    consume(payload);
    println!("Sent {bytes} bytes");
    // payload is no longer usable
}
```

| Contract | Meaning | Polyglot bridge |
| --- | --- | --- |
| &T | Temporary shared access | C++ const T&, plus checked lifetime/aliasing |
| &mut T | Temporary exclusive access | C++ T&, plus exclusivity |
| T, when non-Copy | Ownership transfer | C++ owning move semantics |

C# ref permits access to caller storage but does not generally prohibit other aliases, so it is not equivalent to &mut. Python object parameters do not express exclusivity either.

For read-only text, prefer &str over &String: literals, slices, and borrowed Strings can all satisfy the contract.

## 5. Aliasing XOR mutability

For a given region while borrows overlap, safe Rust permits either multiple shared references or one exclusive mutable reference. Exclusive access cannot overlap another usable borrow of that region. Disjoint fields can be borrowed separately when the compiler can prove their separation.

Python allows simultaneous read/write aliases:

```python
jobs = ["sync"]
reader = jobs
writer = jobs
writer.append("report")
print(reader)  # Observes mutation
```

Rust rejects this overlapping access:

```rust
let mut jobs = vec![String::from("sync")];
let reader = &jobs;
let writer = &mut jobs; // Rejected: reader is used later
writer.push(String::from("report"));
println!("{reader:?}");
```

This prevents invalidation as well as uncontrolled mutation. C++ can leave a reference dangling after vector reallocation:

```cpp
std::vector<int> jobs{1};
const int& first = jobs[0];
jobs.reserve(jobs.capacity() + 1); // Forces reallocation
std::cout << first;               // Undefined behavior
```

Rust rejects the analogous mutation while the element reference remains live:

```rust
let mut jobs = vec![1];
let first = &jobs[0];
jobs.reserve(jobs.capacity() + 1); // Rejected
println!("{first}");
```

Python/C# object references generally keep their target objects alive even when a collection changes. C++ references into container storage do not. Rust checks the borrowed element's dependency on its container.

Interior mutability changes how mutation is permitted through shared references; it does not remove access rules. Module 4 covers the runtime checks and synchronization involved.

## 6. Lifetime analysis follows use

Non-lexical lifetimes let a borrow end at its last required use rather than always at the end of the enclosing scope. The compiler rejects references that could outlive their source.

```rust
fn customer_name() -> &str {
    let name = String::from("Acme");
    name.as_str() // Rejected: name is destroyed on return
}
```

Returning a Python/C# reference can keep an object alive. A Rust borrow does not extend its owner's lifetime. Returning a C++ reference to this local would leave a dangling reference.

When designing an integration API, decide whether the callee must inspect, mutate, or retain a resource. Borrow for temporary access; transfer ownership when the callee needs to own it. Avoid reflexively cloning just to satisfy the compiler: first examine whether the access contract or ordering is wrong.

## Your exercise

Proceed to [challenge.md](challenge.md). Edit [challenge.rs](challenge.rs), then complete [reflection.md](reflection.md). Request a review when ready; your attempt stays yours, and the review will focus on both behavior and reasoning.
