// Module 3 working examples. The challenge is compiled separately.

trait Summary {
    fn summary(&self) -> String;
}

#[derive(Debug)]
struct Incident {
    id: u32,
    service: String,
    open: bool,
}

impl Incident {
    fn new(id: u32, service: &str) -> Self {
        Self { id, service: service.to_owned(), open: true }
    }

    fn close(&mut self) {
        self.open = false;
    }
}

impl Summary for Incident {
    fn summary(&self) -> String {
        let state = if self.open { "open" } else { "closed" };
        format!("INC-{} [{}]: {}", self.id, state, self.service)
    }
}

struct Deployment {
    service: String,
    version: String,
}

impl Summary for Deployment {
    fn summary(&self) -> String {
        format!("deploy {} {}", self.service, self.version)
    }
}

fn publish<T: Summary>(item: &T) {
    println!("{}", item.summary());
}

fn main() {
    let mut incident = Incident::new(42, "checkout");
    publish(&incident);
    incident.close();
    publish(&incident);

    let deployment = Deployment {
        service: String::from("search"),
        version: String::from("2.4.0"),
    };
    publish(&deployment);
}
