# Module 1 — Your explanation

Fill this in alongside your edit to challenge.rs. Short, precise answers are enough.

## Challenge reasoning

1. Which expression creates the shared borrow, and what does it borrow?

Your answer:

2. Which expression needs exclusive access? Why does the original code conflict?

Your answer:

3. Where is the shared reference last used in your corrected code?

Your answer:

4. Why could mutating a String invalidate a borrowed view of its contents?

Your answer:

## Ownership checks

5. In your own words, what do `let` and `mut` communicate to a reader?

Your answer:

6. What is the difference between `String::from(...)` and `value.push_str(...)`?

Your answer:

7. Contrast `let b = a` for a `u32` and a `String`. What does `clone()` change?

Your answer:

8. Why does borrowing `&customer` let a function inspect the text without taking ownership?

Your answer:
