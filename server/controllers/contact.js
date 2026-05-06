const nodemailer = require("nodemailer");

const required = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!required(name) || !required(email) || !required(subject) || !required(message)) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject, and message are required.",
      });
    }

    const transporter = createTransporter();

    if (!transporter || !process.env.CONTACT_TO_EMAIL) {
      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL on the server.",
      });
    }

    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"M8-BID Enquiry from ${name}" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New enquiry: ${subject}`,
      text: [
        "New enquiry received from M8-BID contact form.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2>New enquiry received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p>${String(message).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Your enquiry has been sent successfully.",
    });
  } catch (error) {
    console.error("Contact enquiry error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send enquiry. Please try again later.",
    });
  }
};

module.exports = { sendEnquiry };
