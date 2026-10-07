# Module 4 — Smart pointers and thread-safe sharing

Goal: choose an ownership container deliberately, understand interior mutability, and share state across threads without data races. Work through [examples.rs](examples.rs), then attempt [challenge.md](challenge.md).

## Vocabulary before the code

- The **stack** stores short-lived function data in a fast, structured order. The **heap** stores allocations whose size or lifetime needs more flexibility.
- A **pointer** is a value that identifies where other data lives. A Rust **reference** such as `&T` is a checked, temporary pointer that does not own the data.
- A **smart pointer** is an owning container that also applies a policy, such as heap allocation or shared ownership.
- A **reference count** records how many owners share one allocation.
- **Interior mutability** means changing inner data through an outer value that is not itself declared `mut`; another mechanism still enforces safe access.
- A **thread** is an independently scheduled path of execution within a process.
- A **mutex** allows only one thread at a time to access protected data.
- A **data race** is overlapping unsynchronized access where at least one access writes. Safe Rust prevents data races.
- **Atomic** operations coordinate a small shared value, such as a reference count, without being observed halfway through an update.

## 1. A smart pointer owns data and adds a policy

References such as `&T` borrow; smart pointers usually own. Rust automatically lets many smart pointers be used like references and cleans them up when their owner leaves scope. The traits behind those behaviors are named `Deref` and `Drop`; knowing their names is enough for this module.

Python objects, Java objects, and JavaScript objects are normally heap-managed references with garbage collection hidden behind the runtime. Rust asks you to choose the ownership policy where it matters.

## 2. `Box<T>` gives one owner heap allocation

```rust
let config = Box::new(String::from("production"));
println!("{config}");
```

Use `Box<T>` when a value needs a stable heap allocation, when a recursive type needs a known outer size, or when owning a trait object such as `Box<dyn Summary>`. It does not create shared ownership by itself.

## 3. `Rc<T>` shares immutable ownership on one thread

```rust
use std::rc::Rc;

let service = Rc::new(String::from("checkout"));
let monitor = Rc::clone(&service);
println!("owners: {}", Rc::strong_count(&service));
```

`Rc` means reference counted. Cloning an `Rc` increments the ownership count; it does not clone the inner `String`. The value is dropped after the last owner disappears. This resembles ordinary managed references, but cycles are not collected and `Rc` is deliberately not thread-safe.

## 4. `RefCell<T>` moves borrow checking to runtime

```rust
use std::cell::RefCell;

let events = RefCell::new(Vec::new());
events.borrow_mut().push("started");
println!("{:?}", events.borrow());
```

`RefCell<T>` provides **interior mutability**: the outer binding can remain immutable while controlled runtime guards permit inner mutation. The same one-writer-or-many-readers rule still applies, but a violation panics at runtime instead of failing compilation.

`Rc<RefCell<T>>` is a common single-threaded shared-mutable pattern. Use it only when normal ownership and borrowing cannot express the design cleanly; runtime borrow failures and reference cycles become your responsibility.

## 5. `Arc<Mutex<T>>` shares mutable state across threads

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let events = Arc::new(Mutex::new(Vec::new()));
let worker_events = Arc::clone(&events);

let worker = thread::spawn(move || {
    worker_events.lock().unwrap().push(String::from("worker complete"));
});

worker.join().unwrap();
println!("{:?}", events.lock().unwrap());
```

`Arc` is an atomically reference-counted owner suitable for threads. `Mutex` permits one holder at a time and returns a guard that unlocks when dropped. Java's closest tools are shared references plus `synchronized`/locks. Python has `threading.Lock`, though the GIL is not a substitute for protecting application invariants. JavaScript ordinary objects stay within one event-loop agent; Workers require messaging or explicitly shared memory.

Keep lock scopes short, define a consistent lock order, and handle poisoning according to the application's recovery policy. Mutexes prevent data races, not deadlocks or incorrect business logic.

## 6. `Send` and `Sync` are compile-time thread-safety contracts

`Send` means ownership may cross a thread boundary. `Sync` means shared references may safely be used from multiple threads. These marker traits are usually inferred from a type's fields.

`Rc<T>` is neither `Send` nor `Sync` because its counter is not synchronized. `Arc<T>` uses atomic counting, but the inner `T` must also satisfy the required thread-safety bounds. `RefCell<T>` is not `Sync`; `Mutex<T>` provides synchronized interior mutability.

The advanced lesson is architectural: choose message passing when ownership can move cleanly, and shared state when multiple workers genuinely need the same resource. A compiler-approved `Arc<Mutex<T>>` is safe from data races, not automatically easy to maintain.

## 7. Challenge checkpoint

The challenge attempts to send `Rc<Mutex<_>>` into a worker thread, producing E0277 because `Rc` is not `Send`. Preserve the real thread and the shared log while selecting the thread-safe ownership policy. See [challenge.md](challenge.md).
