// Intentionally broken: E0277 (`Rc<...>` cannot be sent between threads safely).
// Read challenge.md before editing. No solution is included.

use std::rc::Rc;
use std::sync::Mutex;
use std::thread;

fn main() {
    let events = Rc::new(Mutex::new(Vec::new()));
    let worker_events = Rc::clone(&events);

    let worker = thread::spawn(move || {
        worker_events
            .lock()
            .unwrap()
            .push(String::from("worker complete"));
    });

    worker.join().unwrap();
    println!("Events: {:?}", events.lock().unwrap());
}
