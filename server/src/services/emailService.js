/**
 * Email Service for InsurCheck
 * Handles tenant admin invitation emails using SendGrid
 */

import sgMail from '@sendgrid/mail';

/**
 * Initialize SendGrid with API key
 */
const initializeEmailService = () => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('⚠️ SENDGRID_API_KEY not found. Email service disabled.');
    return false;
  }
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid email service initialized');
  return true;
};

/**
 * Retry function for failed email deliveries
 */
const retryEmailDelivery = async (emailFunction, params, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Email delivery attempt ${attempt}/${maxRetries}`);
      const result = await emailFunction(params);
      
      if (result.success) {
        console.log(`✅ Email delivery successful on attempt ${attempt}`);
        return result;
      } else {
        lastError = result.error || 'Unknown error';
        console.log(`❌ Email delivery failed on attempt ${attempt}: ${lastError}`);
      }
    } catch (error) {
      lastError = error.message || 'Unknown error';
      console.log(`❌ Email delivery error on attempt ${attempt}: ${lastError}`);
    }
    
    // Wait before retrying (exponential backoff)
    const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
    console.log(`⏳ Waiting ${delay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return {
    success: false,
    error: `Email delivery failed after ${maxRetries} attempts: ${lastError}`
  };
};

/**
 * Send admin invitation email
 */
const sendAdminInvitation = async ({ 
  toEmail, 
  adminName, 
  tenantName, 
  tempPassword,
  fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com'
}) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 MOCK: Admin invitation email would be sent');
      console.log(`To: ${toEmail}`);
      console.log(`Admin: ${adminName}`);
      console.log(`Tenant: ${tenantName}`);
      console.log(`Temp Password: ${tempPassword}`);
      return { success: true, mock: true };
    }

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `Welcome to InsurCheck - ${tenantName} Admin Account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to InsurCheck</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to InsurCheck</h1>
            <p style="color: #e1e8ff; margin: 10px 0 0 0; font-size: 16px;">Your admin account is ready</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e8ff; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #4a5568; margin-top: 0;">Hello ${adminName}!</h2>
            
            <p>Your administrator account for <strong>${tenantName}</strong> has been created successfully.</p>
            
            <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #2d3748;">Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${tempPassword}</code></p>
            </div>
            
            <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #742a2a;">🔒 Important Security Notice</h3>
              <p style="margin: 5px 0; color: #742a2a;">Please change your password immediately after your first login for security purposes.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://app.insurcheck.com'}/admin/login" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Admin Panel
              </a>
            </div>
            
            <div style="border-top: 1px solid #e1e8ff; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: #4a5568;">What you can do as an admin:</h3>
              <ul style="color: #718096;">
                <li>Manage user accounts for your organization</li>
                <li>Configure compliance rules and policies</li>
                <li>Monitor document processing and analytics</li>
                <li>Manage billing and subscription settings</li>
                <li>Generate reports and export data</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px; color: #718096; font-size: 14px;">
              If you have any questions or need assistance, please contact our support team.
            </p>
            
            <p>Best regards,<br>
            <strong>The InsurCheck Team</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 InsurCheck. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to InsurCheck!

Hello ${adminName}!

Your administrator account for ${tenantName} has been created successfully.

Login Credentials:
Email: ${toEmail}
Temporary Password: ${tempPassword}

IMPORTANT: Please change your password immediately after your first login for security purposes.

You can access your admin panel at: ${process.env.FRONTEND_URL || 'https://app.insurcheck.com'}/admin/login

As an admin, you can:
- Manage user accounts for your organization
- Configure compliance rules and policies  
- Monitor document processing and analytics
- Manage billing and subscription settings
- Generate reports and export data

If you have any questions or need assistance, please contact our support team.

Best regards,
The InsurCheck Team

---
This is an automated message. Please do not reply to this email.
© 2024 InsurCheck. All rights reserved.
      `
    };

    console.log(`📧 Sending admin invitation email to: ${toEmail}`);
    const result = await sgMail.send(msg);
    
    console.log(`✅ Admin invitation email sent successfully to ${toEmail}`);
    return { 
      success: true, 
      messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
      recipient: toEmail,
      tenant: tenantName 
    };
    
  } catch (error) {
    console.error('❌ Error sending admin invitation email:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('SendGrid API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.body
      });
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send admin invitation email',
      details: error.response?.body || null
    };
  }
};

/**
 * Send user invitation email
 */
const sendUserInvitation = async ({ 
  toEmail, 
  userName, 
  tenantName, 
  tempPassword,
  adminName,
  fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com'
}) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 MOCK: User invitation email would be sent');
      console.log(`To: ${toEmail}`);
      console.log(`User: ${userName}`);
      console.log(`Tenant: ${tenantName}`);
      console.log(`Temp Password: ${tempPassword}`);
      console.log(`Invited by: ${adminName}`);
      return { success: true, mock: true };
    }

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `Welcome to ${tenantName} - Your InsurCheck Account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${tenantName}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${tenantName}</h1>
            <p style="color: #c6f6d5; margin: 10px 0 0 0; font-size: 16px;">Your account is ready to use</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #c6f6d5; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #4a5568; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>You've been invited by <strong>${adminName}</strong> to join <strong>${tenantName}</strong> on InsurCheck.</p>
            
            <div style="background: #f7fafc; border-left: 4px solid #48bb78; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #2d3748;">Login Credentials</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${tempPassword}</code></p>
            </div>
            
            <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #742a2a;">🔒 Important Security Notice</h3>
              <p style="margin: 5px 0; color: #742a2a;">Please change your password immediately after your first login for security purposes.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://app.insurcheck.com'}/login" 
                 style="background: #48bb78; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            
            <div style="border-top: 1px solid #c6f6d5; padding-top: 20px; margin-top: 30px;">
              <h3 style="color: #4a5568;">Getting Started:</h3>
              <ul style="color: #718096;">
                <li>Upload and manage your insurance documents</li>
                <li>Review compliance status and requirements</li>
                <li>Track document processing and updates</li>
                <li>Access reports and analytics</li>
                <li>Collaborate with your team members</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px; color: #718096; font-size: 14px;">
              If you have any questions or need assistance, please contact your administrator or our support team.
            </p>
            
            <p>Best regards,<br>
            <strong>The InsurCheck Team</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 InsurCheck. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to ${tenantName}!

Hello ${userName}!

You've been invited by ${adminName} to join ${tenantName} on InsurCheck.

Login Credentials:
Email: ${toEmail}
Temporary Password: ${tempPassword}

IMPORTANT: Please change your password immediately after your first login for security purposes.

You can login at: ${process.env.FRONTEND_URL || 'https://app.insurcheck.com'}/login

Getting Started:
- Upload and manage your insurance documents
- Review compliance status and requirements
- Track document processing and updates
- Access reports and analytics
- Collaborate with your team members

If you have any questions or need assistance, please contact your administrator or our support team.

Best regards,
The InsurCheck Team

---
This is an automated message. Please do not reply to this email.
© 2024 InsurCheck. All rights reserved.
      `
    };

    console.log(`📧 Sending user invitation email to: ${toEmail}`);
    const result = await sgMail.send(msg);
    
    console.log(`✅ User invitation email sent successfully to ${toEmail}`);
    return { 
      success: true, 
      messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
      recipient: toEmail,
      tenant: tenantName 
    };
    
  } catch (error) {
    console.error('❌ Error sending user invitation email:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('SendGrid API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.body
      });
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send user invitation email',
      details: error.response?.body || null
    };
  }
};

/**
 * Send email verification email
 */
const sendEmailVerification = async ({ 
  toEmail, 
  userName, 
  verificationToken,
  fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com'
}) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 MOCK: Email verification would be sent');
      console.log(`To: ${toEmail}`);
      console.log(`User: ${userName}`);
      console.log(`Token: ${verificationToken}`);
      return { success: true, mock: true };
    }

    const verificationUrl = `${process.env.FRONTEND_URL || 'https://app.insurcheck.com'}/verify-email?token=${verificationToken}`;

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: 'Verify Your Email Address - InsurCheck',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
            <p style="color: #e1e8ff; margin: 10px 0 0 0; font-size: 16px;">Complete your registration</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e1e8ff; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #4a5568; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>Thank you for registering with InsurCheck. To complete your registration, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #742a2a;">⏰ This verification link will expire in 24 hours for security reasons.</p>
            </div>
            
            <p style="margin-top: 30px; color: #718096; font-size: 14px;">
              If you didn't create an account with InsurCheck, please ignore this email.
            </p>
            
            <p>Best regards,<br>
            <strong>The InsurCheck Team</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 InsurCheck. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Verify Your Email - InsurCheck

Hello ${userName}!

Thank you for registering with InsurCheck. To complete your registration, please verify your email address.

Verify your email by visiting this link:
${verificationUrl}

This verification link will expire in 24 hours for security reasons.

If you didn't create an account with InsurCheck, please ignore this email.

Best regards,
The InsurCheck Team

---
This is an automated message. Please do not reply to this email.
© 2024 InsurCheck. All rights reserved.
      `
    };

    console.log(`📧 Sending email verification to: ${toEmail}`);
    const result = await sgMail.send(msg);
    
    console.log(`✅ Email verification sent successfully to ${toEmail}`);
    return { 
      success: true, 
      messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
      recipient: toEmail 
    };
    
  } catch (error) {
    console.error('❌ Error sending email verification:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('SendGrid API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.body
      });
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send email verification',
      details: error.response?.body || null
    };
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ 
  toEmail, 
  userName, 
  resetToken,
  fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com'
}) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 MOCK: Password reset email would be sent');
      console.log(`To: ${toEmail}`);
      console.log(`User: ${userName}`);
      console.log(`Token: ${resetToken}`);
      return { success: true, mock: true };
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'https://app.insurcheck.com'}/reset-password?token=${resetToken}`;

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: 'Reset Your Password - InsurCheck',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            <p style="color: #fed7d7; margin: 10px 0 0 0; font-size: 16px;">Secure your account</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #fed7d7; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #4a5568; margin-top: 0;">Hello ${userName}!</h2>
            
            <p>We received a request to reset your password for your InsurCheck account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #e53e3e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #e53e3e; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #742a2a;">⏰ This password reset link will expire in 1 hour for security reasons.</p>
            </div>
            
            <p style="margin-top: 30px; color: #718096; font-size: 14px;">
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <p>Best regards,<br>
            <strong>The InsurCheck Team</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 InsurCheck. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Reset Your Password - InsurCheck

Hello ${userName}!

We received a request to reset your password for your InsurCheck account.

Reset your password by visiting this link:
${resetUrl}

This password reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The InsurCheck Team

---
This is an automated message. Please do not reply to this email.
© 2024 InsurCheck. All rights reserved.
      `
    };

    console.log(`📧 Sending password reset email to: ${toEmail}`);
    const result = await sgMail.send(msg);
    
    console.log(`✅ Password reset email sent successfully to ${toEmail}`);
    return { 
      success: true, 
      messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
      recipient: toEmail 
    };
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('SendGrid API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.body
      });
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send password reset email',
      details: error.response?.body || null
    };
  }
};

/**
 * Send audit log email notification
 */
const sendAuditLogEmail = async ({ 
  toEmail, 
  subject,
  auditData,
  fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com'
}) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 MOCK: Audit log email would be sent');
      console.log(`To: ${toEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Data:`, auditData);
      return { success: true, mock: true };
    }

    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: `InsurCheck Alert: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>InsurCheck Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 InsurCheck Alert</h1>
            <p style="color: #feebc8; margin: 10px 0 0 0; font-size: 14px;">${subject}</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #feebc8; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #4a5568; margin-top: 0;">Audit Log Notification</h2>
            
            <div style="background: #f7fafc; border-left: 4px solid #f6ad55; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #2d3748;">Event Details</h3>
              <p style="margin: 5px 0;"><strong>Action:</strong> ${auditData.action || 'Unknown'}</p>
              <p style="margin: 5px 0;"><strong>Resource:</strong> ${auditData.resource || 'Unknown'}</p>
              <p style="margin: 5px 0;"><strong>User:</strong> ${auditData.userEmail || 'System'}</p>
              <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${auditData.timestamp || new Date().toISOString()}</p>
              ${auditData.ipAddress ? `<p style="margin: 5px 0;"><strong>IP Address:</strong> ${auditData.ipAddress}</p>` : ''}
            </div>
            
            ${auditData.details ? `
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #4a5568;">Additional Details</h4>
              <pre style="margin: 0; font-family: monospace; font-size: 12px; color: #2d3748; white-space: pre-wrap;">${JSON.stringify(auditData.details, null, 2)}</pre>
            </div>
            ` : ''}
            
            <p style="margin-top: 30px; color: #718096; font-size: 14px;">
              This is an automated security notification. If you have concerns about this activity, please contact your administrator.
            </p>
            
            <p>Best regards,<br>
            <strong>The InsurCheck Security Team</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #a0aec0; font-size: 12px;">
            <p>This is an automated security message. Please do not reply to this email.</p>
            <p>© 2024 InsurCheck. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
InsurCheck Alert: ${subject}

Audit Log Notification

Event Details:
- Action: ${auditData.action || 'Unknown'}
- Resource: ${auditData.resource || 'Unknown'}
- User: ${auditData.userEmail || 'System'}
- Timestamp: ${auditData.timestamp || new Date().toISOString()}
${auditData.ipAddress ? `- IP Address: ${auditData.ipAddress}` : ''}

${auditData.details ? `
Additional Details:
${JSON.stringify(auditData.details, null, 2)}
` : ''}

This is an automated security notification. If you have concerns about this activity, please contact your administrator.

Best regards,
The InsurCheck Security Team

---
This is an automated security message. Please do not reply to this email.
© 2024 InsurCheck. All rights reserved.
      `
    };

    console.log(`📧 Sending audit log email to: ${toEmail}`);
    const result = await sgMail.send(msg);
    
    console.log(`✅ Audit log email sent successfully to ${toEmail}`);
    return { 
      success: true, 
      messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
      recipient: toEmail 
    };
    
  } catch (error) {
    console.error('❌ Error sending audit log email:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('SendGrid API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        body: error.response.body
      });
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to send audit log email',
      details: error.response?.body || null
    };
  }
};

/**
 * Send audit log email with retry logic
 */
const sendAuditLogEmailWithRetry = async (params) => {
  return retryEmailDelivery(sendAuditLogEmail, params, 3);
};

// Export all functions
export {
  initializeEmailService,
  sendAdminInvitation,
  sendUserInvitation,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendAuditLogEmail,
  sendAuditLogEmailWithRetry,
  retryEmailDelivery
};