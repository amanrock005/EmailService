export class IdempotencyManager {
  constructor() {
    this.sentEmails = new Set();
  }

  isDuplicate(emailId) {
    return this.sentEmails.has(emailId);
  }

  markAsSent(emailId) {
    this.sentEmails.add(emailId);
  }
}
