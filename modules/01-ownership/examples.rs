// Working examples; compile independently from the broken challenge.
fn inspect(payload: &str) -> usize {
    payload.len()
}

fn normalize(payload: &mut String) {
    payload.make_ascii_lowercase();
}

fn consume(payload: String) {
    println!("Consumed: {payload}");
}

fn main() {
    let retries: u32 = 3;
    let saved = retries; // Copy: both bindings remain usable.
    println!("Copy: {retries}, {saved}");

    let original = String::from("Acme");
    let duplicate = original.clone(); // Independent buffer.
    let transferred = original; // Move: original is no longer usable.
    println!("Clone: {duplicate}; moved owner: {transferred}");

    let mut payload = String::from("CUSTOMER CREATED");
    let bytes = inspect(&payload); // Shared borrow, no transfer.
    normalize(&mut payload); // Exclusive borrow, no transfer.
    consume(payload); // Transfer ownership to the function.
    println!("Payload byte count: {bytes}");

    let literal: &str = "Acme"; // Static storage, not an owned heap buffer.
    let owned = String::from("Acme");
    let view: &str = owned.as_str(); // Borrowed heap bytes.
    println!("Views: {literal}, {view}");
}
