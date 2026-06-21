const https = require('https');
const logger = require('../utils/logger');

/**
 * Sends OTP via WhatsApp using the sender WhatsApp number 7905426920.
 * Falls back to simulation logging if no external API URL is defined in .env.
 * 
 * @param {string} phone - Target phone number registered in the user table.
 * @param {string} otp - The generated OTP code.
 */
const sendOTP = async (phone, otp) => {
  try {
    const message = `Your HaloCab Login OTP is ${otp}. Valid for 5 minutes.`;
    const sender = '7905426920';

    // Simulated log for development and verification
    logger.info(`[WhatsApp Service] Sending OTP ${otp} from WhatsApp Number ${sender} to registered number ${phone}`);
    console.log(`\n💬 [WhatsApp Message] To: ${phone} | From: ${sender} | Message: ${message}\n`);

    // If external WhatsApp API URL is defined in environment variables, trigger request
    if (process.env.WHATSAPP_API_URL) {
      const data = JSON.stringify({
        from: sender,
        to: phone,
        message: message,
        token: process.env.WHATSAPP_API_TOKEN
      });

      const url = new URL(process.env.WHATSAPP_API_URL);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          logger.info(`[WhatsApp Service] API response status: ${res.statusCode}. Body: ${body}`);
        });
      });

      req.on('error', (err) => {
        logger.error(`[WhatsApp Service] API request error: ${err.message}`);
      });

      req.write(data);
      req.end();
    }
    return true;
  } catch (error) {
    logger.error(`[WhatsApp Service] Failed to send WhatsApp: ${error.message}`);
    return false;
  }
};

module.exports = { sendOTP };
