export class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.rateLimit = 5; // Max emails per minute
  }

  canSend(emailId) {
    const now = Date.now();
    const lastRequest = this.requests.get(emailId);
    if (lastRequest && now - lastRequest < 60000) {
      return false;
    }
    this.requests.set(emailId, now);
    return true;
  }
}
