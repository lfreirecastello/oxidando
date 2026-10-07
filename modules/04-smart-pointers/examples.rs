// Module 4 working examples. The challenge is compiled separately.

use std::cell::RefCell;
use std::rc::Rc;
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let config = Box::new(String::from("production"));
    println!("box: {config}");

    let service = Rc::new(String::from("checkout"));
    let monitor = Rc::clone(&service);
    println!("rc: {monitor}, owners={}", Rc::strong_count(&service));

    let local_events = Rc::new(RefCell::new(Vec::new()));
    local_events.borrow_mut().push(String::from("validated"));
    println!("refcell: {:?}", local_events.borrow());

    let events = Arc::new(Mutex::new(Vec::new()));
    let mut workers = Vec::new();
    for id in 1..=2 {
        let worker_events = Arc::clone(&events);
        workers.push(thread::spawn(move || {
            worker_events.lock().unwrap().push(format!("worker-{id}"));
        }));
    }
    for worker in workers {
        worker.join().unwrap();
    }
    let mut completed = events.lock().unwrap();
    completed.sort();
    println!("threads: {completed:?}");
}
