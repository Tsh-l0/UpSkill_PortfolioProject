const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Configure transporter based on environment
      if (process.env.NODE_ENV === "production") {
        // Production email configuration (e.g., SendGrid, Mailgun, etc.)
        this.transporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || "gmail",
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT || 587,
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
      } else {
        // Development - use Ethereal or local SMTP
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransporter({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      // Verify transporter
      await this.transporter.verify();
      console.log("✅ Email service initialized");
    } catch (error) {
      console.error("❌ Email service initialization failed:", error);
    }
  }

  async sendEmail({ to, subject, html, text, from }) {
    try {
      if (!this.transporter) {
        throw new Error("Email transporter not initialized");
      }

      const mailOptions = {
        from:
          from ||
          process.env.EMAIL_FROM ||
          "UpSkill Platform <noreply@upskill.dev>",
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log preview URL in development
      if (process.env.NODE_ENV !== "production") {
        console.log("📧 Email sent:", nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl:
          process.env.NODE_ENV !== "production"
            ? nodemailer.getTestMessageUrl(info)
            : null,
      };
    } catch (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const subject = "Welcome to UpSkill Platform! 🚀";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to UpSkill!</h1>
        </header>
        
        <main style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Hi ${user.fullName}! 👋</h2>
          
          <p style="color: #475569; line-height: 1.6; font-size: 16px;">
            Welcome to UpSkill, the developer networking platform where you can showcase your skills, 
            connect with other professionals, and grow your career.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <h3 style="margin-top: 0; color: #1e293b;">Get Started:</h3>
            <ul style="color: #475569; line-height: 1.8;">
              <li>Complete your profile to increase visibility</li>
              <li>Add your skills and experience</li>
              <li>Connect with other developers</li>
              <li>Get endorsements for your skills</li>
              <li>Explore trending content and opportunities</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Complete Your Profile
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            If you have any questions, feel free to reply to this email or contact our support team.
          </p>
        </main>
        
        <footer style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8; font-size: 14px;">
          <p>© 2024 UpSkill Platform. All rights reserved.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/privacy" style="color: #6366f1;">Privacy Policy</a> | 
            <a href="${process.env.FRONTEND_URL}/terms" style="color: #6366f1;">Terms of Service</a>
          </p>
        </footer>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = "Reset Your UpSkill Password 🔐";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </header>
        
        <main style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Hi ${user.fullName},</h2>
          
          <p style="color: #475569; line-height: 1.6;">
            We received a request to reset your password for your UpSkill account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #475569; font-size: 14px;">
            This link will expire in 15 minutes for security reasons.
          </p>
          
          <p style="color: #64748b; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </main>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  // Connection request notification
  async sendConnectionRequestEmail(recipient, requester, message) {
    const subject = `${requester.fullName} wants to connect with you on UpSkill`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: #6366f1; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Connection Request</h1>
        </header>
        
        <main style="padding: 30px; background: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${
              requester.profileImage || "https://via.placeholder.com/100"
            }" 
                 alt="${requester.fullName}" 
                 style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #6366f1;">
          </div>
          
          <h2 style="color: #1e293b; text-align: center;">${
            requester.fullName
          }</h2>
          <p style="color: #64748b; text-align: center;">${
            requester.title || "Developer"
          }</p>
          
          ${
            message
              ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #6366f1;">
              <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/connections" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              View Request
            </a>
          </div>
        </main>
      </div>
    `;

    return this.sendEmail({
      to: recipient.email,
      subject,
      html,
    });
  }

  // Skill endorsement notification
  async sendEndorsementEmail(recipient, endorser, skill, comment) {
    const subject = `${endorser.fullName} endorsed your ${skill.name} skill!`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: #10b981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Skill Endorsement! 🌟</h1>
        </header>
        
        <main style="padding: 30px; background: #f8fafc;">
          <p style="color: #1e293b; font-size: 18px;">
            <strong>${endorser.fullName}</strong> endorsed your <strong>${
      skill.name
    }</strong> skill!
          </p>
          
          ${
            comment
              ? `
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #374151; margin: 0;">"${comment}"</p>
            </div>
          `
              : ""
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/profile" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              View Your Profile
            </a>
          </div>
        </main>
      </div>
    `;

    return this.sendEmail({
      to: recipient.email,
      subject,
      html,
    });
  }

  // Weekly digest email
  async sendWeeklyDigest(user, data) {
    const subject = "Your Weekly UpSkill Digest 📊";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Your Weekly Digest</h1>
        </header>
        
        <main style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b;">Hi ${user.fullName}! 👋</h2>
          
          <p style="color: #475569;">Here's what happened this week:</p>
          
          <div style="display: grid; gap: 15px; margin: 20px 0;">
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">👀 Profile Views</h3>
              <p style="margin: 0; color: #64748b; font-size: 24px; font-weight: bold;">${
                data.profileViews || 0
              }</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">🌟 New Endorsements</h3>
              <p style="margin: 0; color: #64748b; font-size: 24px; font-weight: bold;">${
                data.endorsements || 0
              }</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">🤝 New Connections</h3>
              <p style="margin: 0; color: #64748b; font-size: 24px; font-weight: bold;">${
                data.connections || 0
              }</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
              View Dashboard
            </a>
          </div>
        </main>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }
}

module.exports = new EmailService();
