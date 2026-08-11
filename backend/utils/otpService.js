const nodemailer = require('nodemailer');

/**
 * Send real Email OTP using Nodemailer (Gmail / custom SMTP)
 * Anti-spam best practices applied:
 *  - Both HTML + plain-text versions sent (multipart/alternative)
 *  - Proper Reply-To and X-Mailer headers
 *  - Subject line avoids spam trigger words
 *  - Sender display name is human-readable
 */
const sendRealEmailOtp = async (toEmail, otpCode, userName = 'Valued Customer') => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromName = process.env.EMAIL_FROM_NAME || 'Naivadyam';
  const fromEmail = process.env.EMAIL_FROM || smtpUser || 'no-reply@naivadyam.com';

  if (!smtpUser || !smtpPass) {
    console.warn(`[OTP Email Warning] SMTP credentials not set. Generated Email OTP: ${otpCode} for ${toEmail}`);
    return { success: false, fallback: true, message: 'SMTP credentials missing in .env' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass.trim().replace(/\s+/g, '')
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const firstName = (userName || 'Customer').split(' ')[0];

    // Plain text version (critical for avoiding spam)
    const textContent = `
Namaste ${firstName},

Your Naivadyam account verification code is:

${otpCode}

This code expires in 10 minutes. Do not share it with anyone.

If you did not request this, please ignore this email.

— Team Naivadyam
naivadyam.in | 100% Pure Vegetarian
    `.trim();

    // HTML version
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

  console.warn(`[OTP SMS Warning] SMS provider credentials (TWILIO_ACCOUNT_SID or FAST2SMS_API_KEY) missing in .env. Generated Mobile OTP: ${otpCode} for ${toPhone}`);
  return { success: false, fallback: true, message: 'SMS credentials missing in .env' };
};

module.exports = {
  sendRealEmailOtp,
  sendRealSmsOtp
};
