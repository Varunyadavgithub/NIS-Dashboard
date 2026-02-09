import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email text content
 * @param {Array} options.attachments - Email attachments
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email
 * @param {Object} user - User object
 * @param {string} password - Temporary password
 */
export const sendWelcomeEmail = async (user, password) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Neha Industrial Security</h2>
      <p>Dear ${user.name},</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Please change your password after first login.</p>
      <p>Login at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
      <br>
      <p>Best regards,</p>
      <p>Neha Industrial Security Team</p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Neha Industrial Security',
    html,
  });
};

/**
 * Send payroll notification
 * @param {Object} guard - Guard object
 * @param {Object} payroll - Payroll object
 */
export const sendPayrollNotification = async (guard, payroll) => {
  if (!guard.email) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Salary Credit Notification</h2>
      <p>Dear ${guard.firstName} ${guard.lastName},</p>
      <p>Your salary for ${payroll.periodLabel} has been processed.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Net Salary:</strong> ₹${payroll.netSalary.toLocaleString('en-IN')}</p>
        <p><strong>Payment Date:</strong> ${new Date(payroll.payment.paidAt).toLocaleDateString('en-IN')}</p>
        <p><strong>Payment Method:</strong> ${payroll.payment.method.replace('_', ' ').toUpperCase()}</p>
      </div>
      <p>For detailed payslip, please contact HR.</p>
      <br>
      <p>Best regards,</p>
      <p>Neha Industrial Security</p>
    </div>
  `;

  await sendEmail({
    to: guard.email,
    subject: `Salary Credit - ${payroll.periodLabel}`,
    html,
  });
};

/**
 * Send contract expiry reminder
 * @param {Object} client - Client object
 * @param {number} daysRemaining - Days until expiry
 */
export const sendContractExpiryReminder = async (client, daysRemaining) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ff6600;">Contract Expiry Reminder</h2>
      <p>The contract for the following client is expiring soon:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Client:</strong> ${client.companyName}</p>
        <p><strong>Contract End Date:</strong> ${new Date(client.contract.endDate).toLocaleDateString('en-IN')}</p>
        <p><strong>Days Remaining:</strong> ${daysRemaining}</p>
      </div>
      <p>Please take necessary action for contract renewal.</p>
    </div>
  `;

  await sendEmail({
    to: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
    subject: `Contract Expiry Alert - ${client.companyName}`,
    html,
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPayrollNotification,
  sendContractExpiryReminder,
};