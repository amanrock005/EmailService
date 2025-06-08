import { IdempotencyManager } from "./utils/IdempotencyManager.js";
import { RateLimiter } from "./utils/RateLimiter.js";
import { CircuitBreaker } from "./utils/CircuitBreak.js";
import { EmailQueue } from "./queue/EmailQueue.js";

export class EmailService {
  constructor({
    providers = [],
    idempotencyManager = new IdempotencyManager(),
    rateLimiter = new RateLimiter(),
    circuitBreaker = new CircuitBreaker(),
    emailQueue = new EmailQueue(),
  } = {}) {
    this.providers = providers;
    this.idempotencyManager = idempotencyManager;
    this.rateLimiter = rateLimiter;
    this.circuitBreaker = circuitBreaker;
    this.emailQueue = emailQueue;
  }

  async sendEmail(to, subject, body) {
    const emailId = `${to}-${subject}`;
    if (this.idempotencyManager.isDuplicate(emailId)) {
      console.log(`Email already sent: ${emailId}`);
      return;
    }

    if (!this.rateLimiter.canSend(emailId)) {
      console.log(`Rate limit exceeded for email: ${emailId}`);
      this.emailQueue.addEmail(to, subject, body);
      return;
    }

    for (const provider of this.providers) {
      if (this.circuitBreaker.isOpen()) {
        console.log("Circuit breaker open, skipping provider");
        continue;
      }

      try {
        await this.retry(() => provider.sendEmail(to, subject, body));
        this.idempotencyManager.markAsSent(emailId);
        return;
      } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        this.circuitBreaker.recordFailure();
      }
    }

    console.log("All providers failed, adding email to queue");
    this.emailQueue.addEmail(to, subject, body);
  }

  async retry(action, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        await action();
        return;
      } catch (error) {
        console.error(`Retry ${i + 1} failed: ${error.message}`);
        await this.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
    throw new Error("All retries failed");
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
