// Intentionally broken: E0502.
// Read challenge.md before editing. No solution is included.
fn main() {
    let mut customer = String::from("Acme");

    let preview = customer.as_str();

    customer.push_str(" | ready");

    println!("Preview: {preview}");
    println!("Payload: {customer}");
}
