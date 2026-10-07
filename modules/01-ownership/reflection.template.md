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

5. State the three ownership rules. How does cleanup differ from Python/C# GC?

Your answer:

6. Contrast `let b = a` for a u32 and a String. What does clone change?

Your answer:

7. Does moving a String clone its heap bytes? Does stack allocation imply Copy?

Your answer:

8. Why can a Python function return a local object while Rust cannot return a borrow of a local String?

Your answer:
