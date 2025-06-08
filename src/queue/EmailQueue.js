export class EmailQueue {
  constructor() {
    this.queue = [];
  }

  addEmail(to, subject, body) {
    this.queue.push({ to, subject, body });
  }

  getNextEmail() {
    return this.queue.shift();
  }
}
