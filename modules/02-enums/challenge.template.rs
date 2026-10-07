// Intentionally broken: E0004.
// Read challenge.md before editing. No solution is included.

enum Delivery {
    Queued,
    Sending { percent: u8 },
    Delivered(String),
    Failed(String),
}

fn status_text(status: Delivery) -> String {
    match status {
        Delivery::Queued => String::from("queued"),
        Delivery::Delivered(id) => format!("delivered: {id}"),
        Delivery::Failed(reason) => format!("failed: {reason}"),
    }
}

fn main() {
    let status = Delivery::Sending { percent: 40 };
    println!("{}", status_text(status));
}
