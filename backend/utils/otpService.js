const nodemailer = require('nodemailer');

/**
 * Helper to create cloud-compatible Nodemailer Transporter
 * Reads SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS from Environment Variables
 */
const createMailTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

  if (!user || !pass) {
    // Fallback to local transport if credentials missing
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'naivyadyamtds@gmail.com',
        pass: 'ywqu lsxj vfvl colf'
      }
    });
  }

  if (host.includes('brevo.com') || user.includes('smtp-brevo.com')) {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: port,
      secure: false,
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
};

/**
 * Send real Email OTP using Nodemailer
 */
const sendRealEmailOtp = async (toEmail, otpCode, userName = 'Valued Customer') => {
  const fromName = process.env.EMAIL_FROM_NAME || 'Naivadyam — The Divine Serve';
  const fromEmail = process.env.EMAIL_FROM || 'naivyadyamtds@gmail.com';

  try {
    const transporter = createMailTransporter();
    const firstName = (userName || 'Customer').split(' ')[0];

    const textContent = `
Namaste ${firstName},

Your Naivadyam account verification code is:

${otpCode}

This code expires in 10 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

— Team Naivadyam
naivadyam.in | 100% Pure Vegetarian
    `.trim();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Naivadyam — Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ddd0b0;max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#5A0E0E 0%,#7B1A1A 100%);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#F5C518;letter-spacing:1px;">नैवेद्यम्</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#f5e0b3;letter-spacing:0.5px;">The Divine Serve &nbsp;·&nbsp; 100% Pure Vegetarian</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#3d1206;">Namaste ${firstName},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#5a3d28;line-height:1.6;">
                To complete your registration at Naivadyam, please use the verification code below:
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <div style="display:inline-block;background:#7B1A1A;color:#F5C518;font-size:34px;font-weight:900;letter-spacing:10px;padding:16px 32px;border-radius:12px;border:2px solid #E6A817;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#8c6a50;text-align:center;background:#faf5ed;padding:12px;border-radius:8px;">
                ⏱ This code is valid for <strong>10 minutes</strong> and can only be used once.<br>
                Do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #ebdcb8;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a08070;line-height:1.6;">
                If you did not create a Naivadyam account, please ignore this email.<br>
                &copy; ${new Date().getFullYear()} Naivadyam &nbsp;·&nbsp; naivadyam.in
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: fromEmail,
      to: toEmail,
      subject: `${otpCode} is your Naivadyam verification code`,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'Naivadyam Mailer v1',
        'X-Priority': '1',
        'Importance': 'high'
      }
    });

    console.log(`✅ [Real Email OTP Sent] MessageID: ${info.messageId} to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [Real Email OTP Error] ${error.message}`);
    return { success: false, error: error.message };
  }
};


/**
 * Send real Mobile SMS OTP using Twilio / Fast2SMS API
 */
const sendRealSmsOtp = async (toPhone, otpCode) => {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
    try {
      const twilio = require('twilio');
      const client = twilio(twilioAccountSid, twilioAuthToken);
      const message = await client.messages.create({
        body: `[Naivadyam] Your Mobile Verification OTP is ${otpCode}. Valid for 10 mins. Do not share with anyone.`,
        from: twilioPhoneNumber,
        to: toPhone.startsWith('+') ? toPhone : `+91${toPhone.replace(/[^0-9]/g, '')}`
      });
      console.log(`✅ [Real Twilio SMS OTP Sent] SID: ${message.sid} to ${toPhone}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      console.error(`❌ [Real Twilio SMS Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  // Fast2SMS API integration (popular for Indian numbers)
  const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsApiKey) {
    try {
      const axios = require('axios');
      const cleanNum = toPhone.replace(/[^0-9]/g, '').slice(-10);
      const res = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        variables_values: otpCode,
        route: 'otp',
        numbers: cleanNum
      }, {
        headers: { 'authorization': fast2smsApiKey }
      });
      console.log(`✅ [Real Fast2SMS OTP Sent] to ${cleanNum}:`, res.data);
      return { success: true, data: res.data };
    } catch (err) {
      console.error(`❌ [Real Fast2SMS Error] ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  console.warn(`[OTP SMS Warning] SMS provider credentials missing in .env. Generated Mobile OTP: ${otpCode} for ${toPhone}`);
  return { success: false, fallback: true, message: 'SMS credentials missing in .env' };
};

/**
 * Send Customer Contact Inquiry Email
 */
const sendContactInquiryEmail = async ({ name, email, phone, subject, message }) => {
  try {
    const transporter = createMailTransporter();
    const cleanSubject = subject || 'General Query';
    const storeEmail = 'naivyadyamtds@gmail.com';

    // 1. Email sent to official store inbox naivyadyamtds@gmail.com
    await transporter.sendMail({
      from: `"Naivadyam Contact Desk" <${storeEmail}>`,
      replyTo: email,
      to: storeEmail,
      subject: `[New Inquiry] ${cleanSubject} - ${name}`,
      text: `New Customer Inquiry Received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${cleanSubject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f0e8;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #7B1A1A;">
            <h2 style="color: #7B1A1A; margin-top: 0;">🪔 New Customer Contact Inquiry</h2>
            <hr style="border: 0; border-top: 1px solid #E6A817; margin: 16px 0;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${cleanSubject}</p>
            <div style="background: #faf5ed; padding: 16px; border-radius: 8px; margin-top: 12px;">
              <p style="margin: 0; font-weight: bold; color: #3d1206;">Message:</p>
              <p style="margin-top: 8px; color: #5a3d28; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `
    });

    // 2. Automated Confirmation Email sent back to customer
    await transporter.sendMail({
      from: `"Naivadyam — The Divine Serve" <${storeEmail}>`,
      to: email,
      subject: `We have received your inquiry: ${cleanSubject}`,
      text: `Namaste ${name},\n\nThank you for contacting Naivadyam. We have received your message regarding "${cleanSubject}" and our team will get back to you within 4 hours.\n\n— Team Naivadyam\nnaivyadyamtds@gmail.com | +91 8149471804`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f0e8;">
          <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ddd0b0;">
            <h2 style="color: #7B1A1A; text-align: center; margin-top: 0;">नैवेद्यम् — The Divine Serve</h2>
            <p style="color: #3d1206; font-size: 15px;"><strong>Namaste ${name},</strong></p>
            <p style="color: #5a3d28; line-height: 1.6;">Thank you for reaching out to us. We have successfully received your inquiry regarding <strong>"${cleanSubject}"</strong>.</p>
            <div style="background: #faf5ed; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #E6A817;">
              <p style="margin: 0; font-size: 13px; color: #5a3d28;">Our customer support team is reviewing your message and will respond to <strong>${email}</strong> within 4 business hours.</p>
            </div>
            <p style="color: #8c6a50; font-size: 12px; text-align: center; margin-top: 24px;">
              Naivadyam &nbsp;·&nbsp; 100% Pure Vegetarian &nbsp;·&nbsp; Helpline: +91 8149471804
            </p>
          </div>
        </div>
      `
    });

    console.log(`✅ [Contact Inquiry Emails Dispatched] for ${name} (${email})`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Contact Inquiry Error] ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Email Notification when a new Support Ticket is created
 */
const sendTicketCreatedNotification = async (ticket) => {
  try {
    const transporter = createMailTransporter();
    const ticketIdStr = ticket._id ? ticket._id.toString().slice(-6).toUpperCase() : 'TK' + Date.now().toString().slice(-4);
    const storeEmail = 'naivyadyamtds@gmail.com';

    // 1. Email to Admin (naivyadyamtds@gmail.com)
    await transporter.sendMail({
      from: `"Naivadyam Support Desk" <${storeEmail}>`,
      to: storeEmail,
      subject: `🚨 [New Ticket #${ticketIdStr}] ${ticket.priority || 'Medium'} Priority: ${ticket.subject}`,
      text: `New Ticket Created:\nTicket ID: #${ticketIdStr}\nUser: ${ticket.userName} (${ticket.userEmail})\nOrder ID: ${ticket.orderId || 'N/A'}\nPriority: ${ticket.priority}\nSubject: ${ticket.subject}\n\nMessage:\n${ticket.message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f0e8;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #7B1A1A;">
            <h2 style="color: #7B1A1A; margin-top: 0;">🎫 New Support Ticket #${ticketIdStr}</h2>
            <hr style="border: 0; border-top: 1px solid #E6A817; margin: 16px 0;" />
            <p><strong>User Name:</strong> ${ticket.userName}</p>
            <p><strong>User Email:</strong> ${ticket.userEmail}</p>
            <p><strong>Order ID:</strong> ${ticket.orderId || 'None'}</p>
            <p><strong>Priority:</strong> <span style="background: #7B1A1A; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${ticket.priority || 'Medium'}</span></p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <div style="background: #faf5ed; padding: 16px; border-radius: 8px; margin-top: 12px; border-left: 4px solid #7B1A1A;">
              <p style="margin: 0; font-weight: bold; color: #3d1206;">User Message:</p>
              <p style="margin-top: 8px; color: #5a3d28; white-space: pre-wrap;">${ticket.message}</p>
            </div>
          </div>
        </div>
      `
    });

    // 2. Email to User (ticket.userEmail)
    await transporter.sendMail({
      from: `"Naivadyam Customer Care" <${storeEmail}>`,
      to: ticket.userEmail,
      subject: `Support Ticket #${ticketIdStr} Received: ${ticket.subject}`,
      text: `Namaste ${ticket.userName},\n\nWe have received your support ticket #${ticketIdStr}.\n\nSubject: ${ticket.subject}\nPriority: ${ticket.priority}\nMessage: ${ticket.message}\n\nOur team is reviewing your ticket and will respond shortly.\n\n— Team Naivadyam\nnaivyadyamtds@gmail.com | +91 8149471804`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f0e8;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ddd0b0;">
            <h2 style="color: #7B1A1A; text-align: center; margin-top: 0;">नैवेद्यम् — Support Desk</h2>
            <p style="color: #3d1206;"><strong>Namaste ${ticket.userName},</strong></p>
            <p style="color: #5a3d28;">Your support ticket <strong>#${ticketIdStr}</strong> has been logged successfully.</p>
            <div style="background: #faf5ed; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #E6A817;">
              <p style="margin: 0 0 6px; font-weight: bold; color: #7B1A1A;">Ticket Details:</p>
              <p style="margin: 2px 0; font-size: 13px; color: #3d1206;"><strong>Subject:</strong> ${ticket.subject}</p>
              <p style="margin: 2px 0; font-size: 13px; color: #3d1206;"><strong>Priority:</strong> ${ticket.priority || 'Medium'}</p>
              <p style="margin: 2px 0; font-size: 13px; color: #3d1206;"><strong>Status:</strong> Open</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #5a3d28;"><strong>Your Message:</strong> ${ticket.message}</p>
            </div>
            <p style="font-size: 12px; color: #8c6a50; text-align: center; margin-top: 20px;">
              You can check real-time ticket updates in your account profile section.<br>
              Naivadyam Customer Care &nbsp;·&nbsp; Helpline: +91 8149471804
            </p>
          </div>
        </div>
      `
    });

    console.log(`✅ [Ticket Created Notifications Sent] Ticket #${ticketIdStr}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Ticket Email Error] ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Email Notification when Admin responds to a Support Ticket
 */
const sendTicketReplyNotification = async (ticket, adminReply, newStatus) => {
  try {
    const transporter = createMailTransporter();
    const ticketIdStr = ticket._id ? ticket._id.toString().slice(-6).toUpperCase() : 'TK';
    const storeEmail = 'naivyadyamtds@gmail.com';

    await transporter.sendMail({
      from: `"Naivadyam Customer Support" <${storeEmail}>`,
      to: ticket.userEmail,
      subject: `Update on Ticket #${ticketIdStr}: ${ticket.subject}`,
      text: `Namaste ${ticket.userName},\n\nOur support team has updated your ticket #${ticketIdStr}.\n\nNew Status: ${newStatus || ticket.status}\nResponse from Naivadyam Support:\n${adminReply}\n\n— Team Naivadyam\nnaivyadyamtds@gmail.com | +91 8149471804`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f0e8;">
          <div style="max-width: 540px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #7B1A1A;">
            <h2 style="color: #7B1A1A; text-align: center; margin-top: 0;">नैवेद्यम् — Ticket Response</h2>
            <p style="color: #3d1206;"><strong>Namaste ${ticket.userName},</strong></p>
            <p style="color: #5a3d28;">Our customer support team has responded to your ticket <strong>#${ticketIdStr}</strong>.</p>
            
            <div style="background: #faf5ed; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #1D7A40;">
              <p style="margin: 0 0 6px; font-weight: bold; color: #1D7A40;">Support Response:</p>
              <p style="margin: 0; color: #3d1206; font-size: 14px; white-space: pre-wrap;">${adminReply}</p>
            </div>

            <p style="font-size: 13px; color: #3d1206;"><strong>Updated Ticket Status:</strong> <span style="font-weight: bold; color: #7B1A1A;">${newStatus || ticket.status}</span></p>

            <p style="font-size: 12px; color: #8c6a50; text-align: center; margin-top: 24px;">
              Naivadyam Customer Care &nbsp;·&nbsp; Helpline: +91 8149471804 &nbsp;·&nbsp; naivyadyamtds@gmail.com
            </p>
          </div>
        </div>
      `
    });

    console.log(`✅ [Ticket Reply Email Sent] to ${ticket.userEmail} for Ticket #${ticketIdStr}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ [Ticket Reply Email Error] ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send Password Reset Email with 6-digit OTP code
 */
const sendPasswordResetEmail = async (toEmail, otpCode, userName = 'Valued Customer') => {
  const fromName = process.env.EMAIL_FROM_NAME || 'Naivadyam — The Divine Serve';
  const fromEmail = process.env.EMAIL_FROM || 'naivyadyamtds@gmail.com';

  try {
    const transporter = createMailTransporter();
    const firstName = (userName || 'Customer').split(' ')[0];

    const textContent = `
Namaste ${firstName},

Your password reset verification code for Naivadyam is:

${otpCode}

This code expires in 10 minutes. Do not share it with anyone.

If you did not request a password reset, please ignore this email.

— Team Naivadyam
naivadyam.in | Helpline: +91 8149471804
    `.trim();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Naivadyam — Password Reset Code</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #7B1A1A;max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#5A0E0E 0%,#7B1A1A 100%);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#F5C518;letter-spacing:1px;">नैवेद्यम्</h1>
              <p style="margin:6px 0 0;font-size:12px;color:#f5e0b3;letter-spacing:0.5px;">Account Password Reset &nbsp;·&nbsp; The Divine Serve</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#3d1206;">Namaste ${firstName},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#5a3d28;line-height:1.6;">
                We received a request to reset your Naivadyam account password. Please use the verification code below to set a new password:
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <div style="display:inline-block;background:#7B1A1A;color:#F5C518;font-size:34px;font-weight:900;letter-spacing:10px;padding:16px 32px;border-radius:12px;border:2px solid #E6A817;">
                      ${otpCode}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#8c6a50;text-align:center;background:#faf5ed;padding:12px;border-radius:8px;border-left:4px solid #E6A817;">
                ⏱ This code is valid for <strong>10 minutes</strong>.<br>
                For security reasons, do not share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;border-top:1px solid #ebdcb8;">
              <p style="margin:0;font-size:11px;color:#a08070;line-height:1.6;">
                If you did not request a password reset, please secure your account immediately.<br>
                &copy; ${new Date().getFullYear()} Naivadyam &nbsp;·&nbsp; Helpline: +91 8149471804
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: fromEmail,
      to: toEmail,
      subject: `${otpCode} is your Naivadyam Password Reset Code`,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Mailer': 'Naivadyam Mailer v1',
        'X-Priority': '1',
        'Importance': 'high'
      }
    });

    console.log(`✅ [Password Reset Email Sent] MessageID: ${info.messageId} to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [Password Reset Email Error] ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRealEmailOtp,
  sendRealSmsOtp,
  sendContactInquiryEmail,
  sendTicketCreatedNotification,
  sendTicketReplyNotification,
  sendPasswordResetEmail
};
