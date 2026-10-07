// Module 2 working examples. The challenge is compiled separately.

#[derive(Debug)]
enum Delivery {
    Queued,
    Sending { percent: u8 },
    Delivered(String),
    Failed(String),
}

fn describe(delivery: Delivery) -> String {
    match delivery {
        Delivery::Queued => String::from("queued"),
        Delivery::Sending { percent } => format!("sending: {percent}%"),
        Delivery::Delivered(id) => format!("delivered: {id}"),
        Delivery::Failed(reason) => format!("failed: {reason}"),
    }
}

fn first_service(services: &[String]) -> Option<&str> {
    services.first().map(String::as_str)
}

fn parse_port(raw: &str) -> Result<u16, std::num::ParseIntError> {
    raw.trim().parse::<u16>()
}

fn endpoint(raw_port: &str) -> Result<String, std::num::ParseIntError> {
    let port = parse_port(raw_port)?;
    Ok(format!("127.0.0.1:{port}"))
}

fn main() {
    let states = [
        Delivery::Queued,
        Delivery::Sending { percent: 40 },
        Delivery::Delivered(String::from("pkg-17")),
        Delivery::Failed(String::from("address rejected")),
    ];
    for state in states {
        println!("state: {}", describe(state));
    }

    let services = vec![String::from("billing"), String::from("search")];
    println!("first: {}", first_service(&services).unwrap_or("none"));

    match endpoint(" 8080 ") {
        Ok(address) => println!("endpoint: {address}"),
        Err(error) => println!("configuration error: {error}"),
    }
}
