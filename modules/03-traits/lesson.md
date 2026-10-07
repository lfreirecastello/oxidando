# Module 3 — Structs, traits, and generics

Goal: model domain data with structs, attach behavior with `impl`, define shared contracts with traits, and use generic bounds to make reusable code honest. Work through [examples.rs](examples.rs), then attempt [challenge.md](challenge.md).

## Vocabulary before the code

- A **struct** is a custom type that groups named pieces of data.
- A **field** is one named piece of that data, such as `service`.
- A **value** or **instance** is one concrete `Incident` created from the struct definition.
- An **implementation block**, written `impl`, is where behavior belonging to a type is defined.
- A **method** is a function whose first parameter is `self`, `&self`, or `&mut self`.
- A **trait** is a named behavior contract that multiple types may implement.
- A **generic type parameter**, often named `T`, is a placeholder for a concrete type selected by the caller.
- A **trait bound** restricts that placeholder to types providing required behavior.

## 1. Structs give domain data a named shape

```rust
struct Incident {
    id: u32,
    service: String,
    open: bool,
}
```

A Rust struct resembles a Python dataclass, a Java class used as a data carrier, or a JavaScript object with a fixed intended shape. Construction names every field:

```rust
let incident = Incident {
    id: 42,
    service: String::from("checkout"),
    open: true,
};
```

Rust separates the stored data from its implementation blocks. Fields have one owner, and field visibility is explicit at module boundaries.

## 2. `impl` adds methods and associated functions

```rust
impl Incident {
    fn new(id: u32, service: &str) -> Self {
        Self { id, service: service.to_owned(), open: true }
    }

    fn close(&mut self) {
        self.open = false;
    }
}
```

`Self` means the type currently being implemented. `&self` borrows an instance for reading, `&mut self` borrows it exclusively for mutation, and `self` consumes it. Java and Python put methods inside a class body; JavaScript typically uses a class or prototype. Rust's separate block keeps data layout and behavior visibly distinct.

`new` is an associated function because it has no `self` parameter; call it with `Incident::new(...)`. `close` is a method because it receives `&mut self`; call it with `incident.close()`.

## 3. A trait is a behavior contract

```rust
trait Summary {
    fn summary(&self) -> String;
}

impl Summary for Incident {
    fn summary(&self) -> String {
        format!("INC-{}: {}", self.id, self.service)
    }
}
```

A trait is closest to a Java interface, a Python protocol/abstract base class, or a JavaScript convention formalized by TypeScript structural typing. Unlike ordinary duck typing, the Rust compiler verifies that an implementation exists before the call can compile.

Traits may provide default method bodies. They do not imply inheritance of stored fields; use composition for shared data.

## 4. Generics remove duplication; bounds state required capabilities

```rust
fn publish<T: Summary>(item: &T) {
    println!("{}", item.summary());
}
```

`T` is a type parameter. `T: Summary` is a **trait bound**: this function accepts any concrete type that implements `Summary`, and the body may rely on that contract.

The equivalent longer form is often clearer with several constraints:

```rust
fn publish<T>(item: &T)
where
    T: Summary,
{
    println!("{}", item.summary());
}
```

Java generics use bounds such as `<T extends Summary>`. Python and JavaScript can accept any object and fail later if the method is absent; type checkers can improve that, while Rust enforces it during compilation.

## 5. `impl Trait` and static dispatch

For a parameter, `impl Summary` is concise syntax for accepting some type that implements the trait:

```rust
fn log(item: &impl Summary) {
    println!("{}", item.summary());
}
```

Generic trait-bounded code normally uses **static dispatch**: the compiler specializes calls for the concrete types involved. That avoids a virtual-call cost but can increase generated code size. `&dyn Summary` opts into dynamic dispatch when heterogeneous runtime values are the real requirement.

`#[derive(Debug, Clone, PartialEq)]` asks the compiler to generate standard trait implementations. Derive mechanical behavior; write an explicit implementation when domain meaning matters.

## 6. Challenge checkpoint

The challenge passes a domain struct to a generic function whose trait bound it does not satisfy, producing E0277. Preserve the generic API and implement the missing contract. See [challenge.md](challenge.md).
