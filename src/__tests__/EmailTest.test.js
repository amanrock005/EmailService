import { EmailService } from "../EmailService.js"; // import your real EmailService class
import { jest } from "@jest/globals"; // import jest helpers for mocking

describe("EmailService Integration", () => {
  let mockProvider, anotherProvider, emailService;
  let mockIdempotency, mockRateLimiter, mockCircuitBreaker, mockQueue;

  beforeEach(() => {
    // Step 3: Create manual mocks as plain objects with jest.fn()
    mockProvider = { sendEmail: jest.fn() };
    anotherProvider = { sendEmail: jest.fn() };

    mockIdempotency = {
      isDuplicate: jest.fn().mockReturnValue(false),
      markAsSent: jest.fn(),
    };

    mockRateLimiter = {
      canSend: jest.fn().mockReturnValue(true),
    };

    mockCircuitBreaker = {
      isOpen: jest.fn().mockReturnValue(false),
      recordFailure: jest.fn(),
    };

    mockQueue = {
      addEmail: jest.fn(),
    };

    // Step 4: Inject these mocks into your EmailService
    emailService = new EmailService({
      providers: [mockProvider, anotherProvider],
      idempotencyManager: mockIdempotency,
      rateLimiter: mockRateLimiter,
      circuitBreaker: mockCircuitBreaker,
      emailQueue: mockQueue,
    });
  });

  test("should send email via first provider", async () => {
    mockProvider.sendEmail.mockResolvedValueOnce();

    await expect(
      emailService.sendEmail("a@b.com", "Hello", "World")
    ).resolves.not.toThrow();

    expect(mockProvider.sendEmail).toHaveBeenCalled(); // Check if first provider called
    expect(mockIdempotency.markAsSent).toHaveBeenCalled(); // Check if marked as sent
  });

  test("should fallback to second provider if first fails", async () => {
    mockProvider.sendEmail.mockRejectedValueOnce(new Error("fail"));
    anotherProvider.sendEmail.mockResolvedValueOnce();

    await emailService.sendEmail("a@b.com", "Hi", "Body");

    expect(mockProvider.sendEmail).toHaveBeenCalled();
    expect(anotherProvider.sendEmail).toHaveBeenCalled();
  });

  test("should queue email on rate limit", async () => {
    mockRateLimiter.canSend.mockReturnValueOnce(false);

    await emailService.sendEmail("a@b.com", "Hi", "Body");

    expect(mockQueue.addEmail).toHaveBeenCalled();
  });

  test("should avoid duplicate emails", async () => {
    mockIdempotency.isDuplicate.mockReturnValueOnce(true);

    await emailService.sendEmail("a@b.com", "Hi", "Body");

    expect(mockProvider.sendEmail).not.toHaveBeenCalled();
  });
});
