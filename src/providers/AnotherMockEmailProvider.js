export class AnotherMockEmailProvider {
  async sendEmail(to, subject, body) {
    console.log(`AnotherMockEmailProvider sending email to ${to}`);
    // Simulate success or failure
    if (Math.random() > 0.7) {
      throw new Error("Simulated send failure");
    }
  }
}
