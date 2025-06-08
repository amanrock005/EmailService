export class CircuitBreaker {
  constructor() {
    this.failureCount = 0;
    this.failureThreshold = 3;
    this.resetTimeout = 60000; // 1 minute
    this.lastFailureTime = 0;
  }

  isOpen() {
    if (this.failureCount >= this.failureThreshold) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.reset();
        return false;
      }
      return true;
    }
    return false;
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  reset() {
    this.failureCount = 0;
  }
}
