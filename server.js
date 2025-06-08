import express from "express";
import cors from "cors";
import { EmailService } from "./src/EmailService.js";
import { MockEmailProvider } from "./src/providers/MockEmailProvider.js";
import { AnotherMockEmailProvider } from "./src/providers/AnotherMockEmailProvider.js";

const app = express();
const PORT = process.env.PORT || 4000;

const emailService = new EmailService({
  providers: [new MockEmailProvider(), new AnotherMockEmailProvider()],
});

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// POST /send-email endpoint
app.post("/send-email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res
      .status(400)
      .json({ error: "Missing required fields: to, subject, body" });
  }

  try {
    await emailService.sendEmail(to, subject, body);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send email", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
