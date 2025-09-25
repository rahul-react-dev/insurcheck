import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +916354205930)
 * @returns {Promise<{success: boolean, status?: string, error?: string}>}
 */
export const sendOTP = async (phoneNumber) => {
  try {
    console.log(`📱 Sending OTP to phone number: ${phoneNumber}`);
    
    const verification = await client.verify.v2
      .services(verifySid)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });
    
    console.log(`✅ OTP sent successfully. Status: ${verification.status}`);
    return {
      success: true,
      status: verification.status
    };
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<{success: boolean, verified?: boolean, status?: string, error?: string}>}
 */
export const verifyOTP = async (phoneNumber, code) => {
  try {
    console.log(`🔍 Verifying OTP for phone number: ${phoneNumber}`);
    
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });
    
    console.log(`✅ OTP verification result. Status: ${verificationCheck.status}`);
    return {
      success: true,
      verified: verificationCheck.status === 'approved',
      status: verificationCheck.status
    };
  } catch (error) {
    console.error('❌ Error verifying OTP:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} - E.164 formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If it starts with country code, return with +
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }
  
  // If it's 10 digits, assume it's Indian number
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  // If it already starts with +, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Default: add + if not present
  return `+${digitsOnly}`;
};