const nodemailer = require("nodemailer");
const { Resend } = require("resend");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // Gmail requires SSL on
  //  port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Only for development
  }
});
//Function to send OTP via email
exports.sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Hostio Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "🔐 Your One-Time Password (OTP) for Hostio",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 2rem;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.05); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00968A, #00a597); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0;">Your OTP Code</h1>
              <p style="margin: 0.5rem 0 0;">Secure access to Hostio</p>
            </div>

            <!-- Body -->
            <div style="padding: 2rem; text-align: center;">
              <p style="font-size: 1.1rem;">Hello 👋</p>
              <p>Here is your one-time password (OTP):</p>

              <div style="margin: 1.5rem 0;">
                <span style="
                  background-color: #00968A;
                  color: white;
                  padding: 1rem 2rem;
                  font-size: 2rem;
                  font-weight: bold;
                  border-radius: 8px;
                  display: inline-block;
                  letter-spacing: 4px;
                ">
                  ${otp}
                </span>
              </div>

              <p style="font-size: 1rem; color: #333;">This code will expire in <strong>10 minutes</strong>.</p>

              <p style="margin-top: 2rem;">If you didn’t request this code, you can safely ignore this email.</p>

              <p style="margin-top: 2rem;">Thanks for using Hostio!<br/>— The Hostio Team</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 1rem; text-align: center; color: #888; font-size: 0.85rem;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostio. All rights reserved.</p>
            </div>

          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📨 OTP email sent to:", email, "| Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    throw new Error("Failed to send OTP email.");
  }
};

exports.sendDemoConfirmationEmail = async (to, name, meetingUrl, meetingDate, meetingTime) => {
  try {
    const mailOptions = {
      from: `"Hostio Team" <${process.env.SMTP_USER}>`,
      to,
      subject: "🎉 Your Hostio Demo is Booked!",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 2rem;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.05); overflow: hidden;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00a597, #00968A); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0;">Demo Confirmed</h1>
              <p style="margin: 0.5rem 0 0;">Thanks for choosing <strong>Hostio</strong></p>
            </div>

            <!-- Body -->
            <div style="padding: 2rem;">
              <p style="font-size: 1.1rem;">Hi <strong>${name}</strong>,</p>

              <p>We're thrilled to confirm your personalized demo session with our team. 🎯</p>

              <div style="margin: 1.5rem 0; font-size: 1rem;">
                <p><strong>🗓️ Date:</strong> ${meetingDate}</p>
                <p><strong>⏰ Time:</strong> ${meetingTime}</p>
              </div>

              <div style="text-align: center; margin: 2rem 0;">
                <a href="${meetingUrl}" style="background-color: #00968A; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1rem;">
                  🔗 Join Demo Meeting
                </a>
              </div>

              <p>We’re here to help you make the most of Hostio. Be prepared for a quick and helpful walkthrough of how we can support your hiring goals!</p>

              <p style="margin-top: 2rem;">See you soon!<br/>— The Hostio Team</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 1rem; text-align: center; color: #888; font-size: 0.85rem;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostio. All rights reserved.</p>
            </div>

          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("📨 Demo confirmation email sent to:", to);
  } catch (error) {
    console.error("❌ Failed to send demo confirmation email:", error.message);
    throw error;
  }
};


exports.sendCancellationEmail = async ({ to, subject, companyName, meetingTime, reason }) => {
  try {
    await transporter.sendMail({
      from: `"Hostio Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 2rem;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.05); overflow: hidden;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff5f6d, #ffc371); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0;">Demo Cancelled</h1>
              <p style="margin: 0.5rem 0 0;">with <strong>${companyName}</strong></p>
            </div>

            <!-- Body -->
            <div style="padding: 2rem;">
              <p style="font-size: 1.1rem;">Hi <strong>${companyName}</strong> team,</p>

              <p>We wanted to let you know that your scheduled <strong>Hostio demo</strong> on:</p>
              <p style="font-size: 1.2rem; font-weight: bold; color: #00968A;">${meetingTime}</p>
              <p>has unfortunately been <strong style="color: #dc3545;">cancelled</strong>.</p>

              <div style="margin: 1.5rem 0;">
                <p style="font-weight: bold; margin-bottom: 0.25rem;">Reason for cancellation:</p>
                <blockquote style="margin: 0; padding-left: 1rem; border-left: 4px solid #dc3545; color: #555;">
                  ${reason}
                </blockquote>
              </div>

              <p>You’re welcome to <a href="https://hostio.com/demo" style="color: #00968A; font-weight: bold;">reschedule a new demo</a> at your convenience.</p>

              <p style="margin-top: 2rem;">Thanks for your understanding,<br/>— The Hostio Team</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f1f1f1; padding: 1rem; text-align: center; color: #888; font-size: 0.85rem;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostio. All rights reserved.</p>
            </div>

          </div>
        </div>
      `
    });

    console.log("📬 Cancellation email sent to:", to);
  } catch (error) {
    console.error("❌ Failed to send cancellation email:", error.message);
    throw new Error("Email dispatch failed");
  }
};

exports.sendPremiumConfirmationEmail = async (to, companyName, premiumExpiresDate, amount) => {
  try {
    const formattedDate = new Date(premiumExpiresDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedAmount = `$${parseFloat(amount).toFixed(2)}`;

    const mailOptions = {
      from: `"Hostio Premium" <${process.env.SMTP_USER}>`,
      to,
      subject: `🎉 Premium Activated: Welcome to the VIP Lounge, ${companyName}!`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f9; padding: 2rem;">
          <div style="max-width: 650px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00a597, #00968A); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0; font-size: 1.8rem;">🌟 Premium Plan Activated!</h1>
              <p style="margin: 0.5rem 0 0; font-size: 1rem;">Thank you for upgrading, <strong>${companyName}</strong>!</p>
            </div>

            <!-- Body -->
            <div style="padding: 2rem;">
              <p style="font-size: 1.1rem;">Hi <strong>${companyName}</strong> team,</p>

              <p>Welcome to the top-tier experience on <strong style="color: #00a597;">Hostio</strong>! 🎉 Your premium subscription has been successfully activated.</p>

              <p><strong>💳 Payment Received:</strong> <span style="color: #009688; font-size: 1.1rem;">${formattedAmount}</span></p>

              <p>You're now officially part of the VIP club, and you can enjoy features like:</p>
              <ul style="line-height: 1.6;">
                <li>🚀 <strong>Priority support</strong></li>
                <li>🏅 <strong>Verified badge</strong> on your profile</li>
                <li>📈 <strong>Boosted job post visibility</strong></li>
                <li>📢 <strong>Increased job posting limits</strong></li>
              </ul>

              <p style="margin-top: 1.5rem;"><strong>🗓️ Valid Until:</strong><br />
              <span style="font-size: 1.2rem; color: #00a597;">${formattedDate}</span></p>

              <p>If you ever need help or have questions, feel free to reach out to us at <a href="mailto:support@hostio.com">support@hostio.com</a>.</p>

              <p style="margin-top:2rem;">Here’s to hiring better and faster!<br/>— The <strong>Hostio Premium Team</strong> 💼</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 1rem; text-align: center; color: #888; font-size: 0.85rem;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostio. All rights reserved.</p>
            </div>

          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Premium confirmation email sent to:", to, "| Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending premium email:", error.message);
    throw error;
  }
};


exports.sendApplicationStatusUpdateEmail = async ({ to, firstName, jobTitle, newStatus, companyName }) => {
  try {
    const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    const statusColor = newStatus.toLowerCase() === "hired" ? "#28a745" :
                        newStatus.toLowerCase() === "rejected" ? "#dc3545" : "#00968A";

    const mailOptions = {
      from: `"Hostio Team" <${process.env.SMTP_USER}>`,
      to,
      subject: `📄 Your application for "${jobTitle}" has been ${capitalizedStatus}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f5f7fa; padding: 2rem;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00968A, #00a3a0); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0;">Application Status Update</h1>
              <p style="margin: 0.5rem 0 0;">at <strong>${companyName}</strong></p>
            </div>

            <!-- Body -->
            <div style="padding: 2rem;">
              <p style="font-size: 1.1rem;">Hi <strong>${firstName}</strong>,</p>

              <p>Your application for the position of <strong>${jobTitle}</strong> has been updated.</p>

              <div style="margin: 1.5rem 0;">
                <span style="
                  background-color: ${statusColor};
                  color: #ffffff;
                  padding: 0.5rem 1.25rem;
                  font-weight: bold;
                  font-size: 1rem;
                  border-radius: 30px;
                  display: inline-block;
                ">
                  ${capitalizedStatus}
                </span>
              </div>

              <p style="font-size: 1rem;">We appreciate your interest and effort in applying. The hiring team at <strong>${companyName}</strong> has reviewed your application, and the status above reflects its current stage.</p>

              <p style="margin-top: 2rem;">Warm wishes,<br/>— The Hostio Team</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 1rem; text-align: center; color: #999; font-size: 0.85rem;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostio. All rights reserved.</p>
            </div>

          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Status update email sent to:", to, "| Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending status update email:", error.message);
    throw new Error("Failed to send application status update email.");
  }
};

exports.sendJobRejectionEmailToCompany = async ({ to, companyName, jobTitle, reason }) => {
  try {
    const mailOptions = {
      from: `"Hostio Admin" <${process.env.SMTP_USER}>`,
      to,
      subject: `❌ Job Posting Rejected: "${jobTitle}"`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 2rem;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc3545, #b02a37); color: white; padding: 2rem; text-align: center;">
              <h1 style="margin: 0;">Job Rejected</h1>
              <p style="margin: 0.5rem 0 0;">for <strong>${companyName}</strong></p>
            </div>

            <!-- Body -->
            <div style="padding: 2rem;">
              <p style="font-size: 1.1rem;">Hello <strong>${companyName}</strong> team,</p>

              <p>We regret to inform you that your job posting titled <strong>"${jobTitle}"</strong> has been <span style="color: #dc3545; font-weight: bold;">rejected</span> by the Hostio admin team.</p>

              <div style="margin: 1.5rem 0;">
                <p style="margin: 0; font-weight: bold;">Reason for rejection:</p>
                <blockquote style="margin: 0.5rem 0; padding-left: 1rem; border-left: 3px solid #dc3545; color: #555;">
                  ${reason}
                </blockquote>
              </div>

              <p>You may review and update the posting, then resubmit for approval.</p>

              <p style="margin-top: 2rem;">If you believe this was a mistake, feel free to reach out to our support team.</p>

              <p style="margin-top: 2rem;">Best regards,<br/>— The Hostio Admin Team</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f0f0f0; padding: 1rem; text-align: center; color: #999; font-size: 0.85rem;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Hostio. All rights reserved.</p>
            </div>

          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📬 Job rejection email sent to:", to, "| Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send job rejection email:", error.message);
    throw new Error("Email dispatch failed");
  }
};

