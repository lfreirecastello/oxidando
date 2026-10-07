// Module 1 working examples. The challenge is compiled separately.

const MAX_RETRIES: u32 = 3;

fn add_tax(price: f64, rate: f64) -> f64 {
    price * (1.0 + rate)
}

fn byte_count(text: &str) -> usize {
    text.len()
}

fn mark_ready(text: &mut String) {
    text.push_str(" | ready");
}

fn main() {
    // 1. Variables: immutable by default, mutable by request.
    let language = "Rust";
    let mut completed = 0;
    completed += 1;
    println!("1. Hello, {language}! checkpoint {completed}/{MAX_RETRIES}");

    // 2. Shadowing may transform a value and change its type.
    let input = " 42 ";
    let input = input.trim();
    let input: u32 = input.parse().expect("the example contains a number");
    println!("2. Parsed number: {input}");

    // 3. Common String and str methods.
    let raw = "  Oxide  ";
    let clean = raw.trim().to_lowercase();
    let mut message = String::from("Learning ");
    message.push_str(&clean);
    message.push('!');
    println!("3. {message}");

    // 4. A Vec<T> is a growable sequence containing one element type.
    let mut scores: Vec<u32> = vec![10, 20];
    scores.push(30);
    let first = scores.get(0);
    println!("4a. Vector first item: {first:?}");
    let last = scores.pop();
    println!("4b. Vector last={last:?}, remaining={scores:?}");

    // 5. A final expression without a semicolon becomes the return value.
    let total = add_tax(100.0, 0.19);
    println!("5. Total with tax: {total:.2}");

    // 6. Copy, Clone, and move are different operations.
    let retries: u32 = 3;
    let saved = retries;
    let original = String::from("Acme");
    let duplicate = original.clone();
    let transferred = original;
    println!("6. Copy={retries}/{saved}; clone={duplicate}; moved={transferred}");

    // 7. Shared and mutable borrows provide temporary access.
    let mut customer = String::from("Acme");
    let bytes = byte_count(&customer);
    mark_ready(&mut customer);
    println!("7. {customer} ({bytes} original bytes)");
}
