import { Resend } from "resend";
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123");

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  password: string,
) {
  // 1. Read the template file
  const templatePath = path.join(
    process.cwd(),
    "src",
    "views",
    "Studentwelcome.hbs",
  );
  const source = fs.readFileSync(templatePath, "utf8");

  // 2. Compile the template with Handlebars
  const template = Handlebars.compile(source);

  // 3. Inject the data
  const htmlToSend = template({
    name: userName,
    password: password,
    organization: process.env.ORG_NAME,
  });

  // 4. Send using Resend
  try {
    const data = await resend.emails.send({
      from: "Onboarding <onboarding@resend.dev>",
      to: userEmail,
      subject: "Welcome to the SimplyClever!",
      html: htmlToSend, // Pass the compiled HTML here
    });
    console.log("Email sent:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Usage
// sendWelcomeEmail('user@example.com', 'Alice', '8921');
