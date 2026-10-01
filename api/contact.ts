
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';



export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed.',
    });
  }

  try {
    const { name, email, subject, message } = req.body ?? {};

    // Basic server-side validation.
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !message.trim()
    ) {
      return res.status(400).json({
        error: 'Name, email, and message are required.',
      });
    }

    // Basic email validation.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        error: 'Please provide a valid email address.',
      });
    }

 if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is missing.');
  return res.status(500).json({
    error: 'Email service is not configured.',
  });
}

const resend = new Resend(process.env.RESEND_API_KEY);

    if (!process.env.CONTACT_TO_EMAIL) {
      console.error('CONTACT_TO_EMAIL is missing.');
      return res.status(500).json({
        error: 'Contact recipient is not configured.',
      });
    }

    if (!process.env.CONTACT_FROM_EMAIL) {
      console.error('CONTACT_FROM_EMAIL is missing.');
      return res.status(500).json({
        error: 'Contact sender is not configured.',
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject?.trim() || 'General Inquiry';
    const cleanMessage = message.trim();

    const { data, error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL],
      replyTo: cleanEmail,
      subject: `[Portfolio] ${cleanSubject}`,

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Portfolio Contact</title>
          </head>

          <body
            style="
              margin: 0;
              padding: 0;
              background: #05070d;
              color: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
            "
          >
            <div
              style="
                max-width: 680px;
                margin: 40px auto;
                padding: 32px;
                background: #0b0f19;
                border: 1px solid #1e293b;
                border-radius: 16px;
              "
            >
              <div
                style="
                  display: inline-block;
                  padding: 7px 12px;
                  border-radius: 999px;
                  background: #111827;
                  border: 1px solid #1e293b;
                  color: #38bdf8;
                  font-size: 12px;
                  font-family: monospace;
                  letter-spacing: 1px;
                "
              >
                PORTFOLIO // NEW TRANSMISSION
              </div>

              <h1
                style="
                  margin: 24px 0 8px;
                  font-size: 28px;
                  color: #ffffff;
                "
              >
                ${escapeHtml(cleanSubject)}
              </h1>

              <p
                style="
                  margin: 0 0 28px;
                  color: #94a3b8;
                  font-size: 14px;
                "
              >
                Someone submitted the contact form on your portfolio.
              </p>

              <div
                style="
                  padding: 20px;
                  background: #111827;
                  border-radius: 12px;
                  border: 1px solid #1e293b;
                "
              >
                <p style="margin: 0 0 12px; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Name:</strong>
                  ${escapeHtml(cleanName)}
                </p>

                <p style="margin: 0 0 12px; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Email:</strong>
                  ${escapeHtml(cleanEmail)}
                </p>

                <p style="margin: 0; color: #cbd5e1;">
                  <strong style="color: #ffffff;">Subject:</strong>
                  ${escapeHtml(cleanSubject)}
                </p>
              </div>

              <div
                style="
                  margin-top: 20px;
                  padding: 20px;
                  background: #05070d;
                  border-radius: 12px;
                  border: 1px solid #1e293b;
                "
              >
                <p
                  style="
                    margin: 0 0 10px;
                    color: #38bdf8;
                    font-size: 12px;
                    font-family: monospace;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                  "
                >
                  Message
                </p>

                <p
                  style="
                    margin: 0;
                    color: #e2e8f0;
                    font-size: 15px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                  "
                >
                  ${escapeHtml(cleanMessage)}
                </p>
              </div>

              <p
                style="
                  margin: 28px 0 0;
                  color: #64748b;
                  font-size: 12px;
                  line-height: 1.6;
                "
              >
                Reply directly to this email to respond to
                ${escapeHtml(cleanEmail)}.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);

      return res.status(500).json({
        error: 'Email delivery failed. Please try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      id: data?.id ?? null,
    });
  } catch (error) {
    console.error('Contact API error:', error);

    return res.status(500).json({
      error: 'Something went wrong while sending your message.',
    });
  }
}

/**
 * Escape user-provided text before putting it into HTML.
 * This prevents submitted content from becoming executable HTML.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

