// Intentionally broken: E0277.
// Read challenge.md before editing. No solution is included.

trait Summary {
    fn summary(&self) -> String;
}

struct Incident {
    id: u32,
    service: String,
    detail: String,
}

fn publish<T: Summary>(item: &T) {
    println!("{}", item.summary());
}

fn main() {
    let incident = Incident {
        id: 42,
        service: String::from("checkout"),
        detail: String::from("unavailable"),
    };
    publish(&incident);
}
