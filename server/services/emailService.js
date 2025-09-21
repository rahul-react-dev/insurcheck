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
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`⏳ Waiting ${delay/1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`❌ Email delivery failed after ${maxRetries} attempts`);
  return { 
    success: false, 
    error: `Failed after ${maxRetries} attempts. Last error: ${lastError}`,
    attempts: maxRetries
  };
};

/**
 * Send tenant admin invitation email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.tenantName - Name of the tenant organization
 * @param {string} params.setupLink - Password setup link
 * @param {string} params.invitedBy - Super admin who sent the invitation
 */
const sendTenantAdminInvitation = async ({ to, tenantName, setupLink, invitedBy }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email service disabled - would send invitation to:', to);
      console.log('🔗 Setup link:', setupLink);
      return { success: false, reason: 'Email service not configured' };
    }

    const msg = {
      to,
      from: {
        email: 'rahul.soni@solulab.co',
        name: 'InsurCheck Platform'
      },
      subject: `Welcome to InsurCheck - Complete Your Account Setup`,
      html: generateInvitationHTML({ to, tenantName, setupLink, invitedBy }),
      text: generateInvitationText({ to, tenantName, setupLink, invitedBy })
    };

    console.log(`📧 Sending invitation email to: ${to}`);
    console.log(`📤 Email details:`, {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });
    
    const result = await sgMail.send(msg);
    
    console.log(`✅ SendGrid response:`, result[0]?.statusCode, result[0]?.headers);
    console.log(`✅ Invitation email sent successfully to: ${to}`);
    return { success: true, message: 'Invitation email sent successfully' };
    
  } catch (error) {
    console.error('❌ SendGrid email error:', error.response?.body || error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body 
    };
  }
};

/**
 * Generate HTML email template for tenant admin invitation
 */
const generateInvitationHTML = ({ to, tenantName, setupLink, invitedBy }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to InsurCheck</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280; }
            .warning { background-color: #fef3c7; color: #92400e; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to InsurCheck!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your tenant admin account is ready for setup</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${to.split('@')[0]},</h2>
                
                <p style="color: #374151; line-height: 1.6;">
                    You've been invited to be a Tenant Administrator for <strong>${tenantName}</strong> 
                    on the InsurCheck platform by ${invitedBy}.
                </p>
                
                <p style="color: #374151; line-height: 1.6;">
                    To complete your account setup and gain access to your tenant administration dashboard, 
                    please click the button below to set your password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${setupLink}" class="button">Complete Account Setup</a>
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> This invitation link will expire in 24 hours for security reasons. 
                    If you don't complete the setup within this time, please contact your super admin for a new invitation.
                </div>
                
                <p style="color: #374151; line-height: 1.6;">
                    Once your account is set up, you'll be able to:
                </p>
                
                <ul style="color: #374151; line-height: 1.8;">
                    <li>Manage users within your tenant organization</li>
                    <li>Configure compliance rules and settings</li>
                    <li>Generate and manage invoices</li>
                    <li>Access compliance analytics and reports</li>
                    <li>Manage notification templates</li>
                </ul>
                
                <p style="color: #374151; line-height: 1.6;">
                    If you have any questions or need assistance, please contact your super admin or our support team.
                </p>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">
                    This invitation was sent by InsurCheck Platform<br>
                    If you didn't expect this invitation, please ignore this email.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate plain text email template for tenant admin invitation
 */
const generateInvitationText = ({ to, tenantName, setupLink, invitedBy }) => {
  return `
Welcome to InsurCheck!

Hello ${to.split('@')[0]},

You've been invited to be a Tenant Administrator for ${tenantName} on the InsurCheck platform by ${invitedBy}.

To complete your account setup and gain access to your tenant administration dashboard, please visit the following link to set your password:

${setupLink}

IMPORTANT: This invitation link will expire in 24 hours for security reasons. If you don't complete the setup within this time, please contact your super admin for a new invitation.

Once your account is set up, you'll be able to:
- Manage users within your tenant organization
- Configure compliance rules and settings
- Generate and manage invoices
- Access compliance analytics and reports
- Manage notification templates

If you have any questions or need assistance, please contact your super admin or our support team.

---
This invitation was sent by InsurCheck Platform
If you didn't expect this invitation, please ignore this email.
  `;
};

/**
 * Send user invitation email (for tenant users invited by admin)
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.firstName - User's first name
 * @param {string} params.lastName - User's last name
 * @param {string} params.tenantName - Name of the tenant organization
 * @param {string} params.tempPassword - Temporary password
 * @param {string} params.invitedBy - Admin who sent the invitation
 * @param {string} params.loginUrl - URL to login to the platform
 */
const sendUserInvitation = async ({ to, firstName, lastName, tenantName, tempPassword, invitedBy, loginUrl }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email service disabled - would send user invitation to:', to);
      console.log('🔑 Temp password:', tempPassword);
      return { success: false, reason: 'Email service not configured' };
    }

    const msg = {
      to,
      from: {
        email: 'rahul.soni@solulab.co',
        name: 'InsurCheck Platform'
      },
      subject: `Welcome to InsurCheck - Your Account is Ready`,
      html: generateUserInvitationHTML({ to, firstName, lastName, tenantName, tempPassword, invitedBy, loginUrl }),
      text: generateUserInvitationText({ to, firstName, lastName, tenantName, tempPassword, invitedBy, loginUrl })
    };

    console.log(`📧 Sending user invitation email to: ${to}`);
    console.log(`📤 Email details:`, {
      to: msg.to,
      from: msg.from,
      subject: msg.subject
    });
    
    const result = await sgMail.send(msg);
    
    console.log(`✅ SendGrid response:`, result[0]?.statusCode, result[0]?.headers);
    console.log(`✅ User invitation email sent successfully to: ${to}`);
    return { success: true, message: 'User invitation email sent successfully' };
    
  } catch (error) {
    console.error('❌ SendGrid user invitation email error:', error.response?.body || error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body 
    };
  }
};

/**
 * Generate HTML email template for user invitation
 */
const generateUserInvitationHTML = ({ to, firstName, lastName, tenantName, tempPassword, invitedBy, loginUrl }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to InsurCheck</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .credentials { background-color: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280; }
            .warning { background-color: #fef3c7; color: #92400e; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to InsurCheck!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
                
                <p style="color: #374151; line-height: 1.6;">
                    You've been invited to join <strong>${tenantName}</strong> on the InsurCheck platform by ${invitedBy}.
                    Your account has been created and is ready to use!
                </p>
                
                <div class="credentials">
                    <h3 style="color: #1d4ed8; margin-top: 0;">Your Login Credentials:</h3>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${to}</p>
                    <p style="margin: 8px 0;"><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${loginUrl}" class="button">Login to Your Account</a>
                </div>
                
                <div class="warning">
                    <strong>Important Security Notice:</strong> Please log in and change your password immediately after your first login. 
                    This temporary password should not be shared with anyone.
                </div>
                
                <p style="color: #374151; line-height: 1.6;">
                    Once you log in, you'll have access to:
                </p>
                
                <ul style="color: #374151; line-height: 1.8;">
                    <li>Your organization's insurance management tools</li>
                    <li>Compliance tracking and reporting</li>
                    <li>Document management system</li>
                    <li>Analytics and insights</li>
                </ul>
                
                <p style="color: #374151; line-height: 1.6;">
                    If you have any questions or need assistance, please contact your administrator or our support team.
                </p>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">
                    This invitation was sent by ${tenantName} via InsurCheck Platform<br>
                    If you didn't expect this invitation, please contact your administrator.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate plain text email template for user invitation
 */
const generateUserInvitationText = ({ to, firstName, lastName, tenantName, tempPassword, invitedBy, loginUrl }) => {
  return `
Welcome to InsurCheck!

Hello ${firstName} ${lastName},

You've been invited to join ${tenantName} on the InsurCheck platform by ${invitedBy}.
Your account has been created and is ready to use!

YOUR LOGIN CREDENTIALS:
Email: ${to}
Temporary Password: ${tempPassword}

Login URL: ${loginUrl}

IMPORTANT SECURITY NOTICE: Please log in and change your password immediately after your first login. This temporary password should not be shared with anyone.

Once you log in, you'll have access to:
- Your organization's insurance management tools
- Compliance tracking and reporting
- Document management system
- Analytics and insights

If you have any questions or need assistance, please contact your administrator or our support team.

---
This invitation was sent by ${tenantName} via InsurCheck Platform
If you didn't expect this invitation, please contact your administrator.
  `;
};

/**
 * Send email verification email for new user signups
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.firstName - User's first name
 * @param {string} params.lastName - User's last name
 * @param {string} params.verificationLink - Email verification link
 */
const sendEmailVerification = async ({ to, firstName, lastName, verificationLink }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email service disabled - would send verification to:', to);
      console.log('🔗 Verification link:', verificationLink);
      return { success: false, reason: 'Email service not configured' };
    }

    const msg = {
      to,
      from: {
        email: 'rahul.soni@solulab.co',
        name: 'InsurCheck Platform'
      },
      subject: `Verify Your Email Address - InsurCheck`,
      html: generateEmailVerificationHTML({ to, firstName, lastName, verificationLink }),
      text: generateEmailVerificationText({ to, firstName, lastName, verificationLink })
    };

    console.log(`📧 Sending email verification to: ${to}`);
    console.log(`📤 Email details:`, {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      verificationLinkLength: verificationLink.length
    });
    console.log(`🔑 SendGrid API Key status: ${process.env.SENDGRID_API_KEY ? 'Present' : 'Missing'}`);
    
    const result = await sgMail.send(msg);
    
    console.log(`✅ SendGrid response status:`, result[0]?.statusCode);
    console.log(`✅ SendGrid response headers:`, result[0]?.headers);
    console.log(`✅ Email verification sent successfully to: ${to}`);
    console.log(`📊 Full SendGrid result:`, result);
    return { success: true, message: 'Email verification sent successfully' };
    
  } catch (error) {
    console.error('❌ SendGrid email verification error:', error.response?.body || error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body 
    };
  }
};

/**
 * Generate HTML email template for email verification
 */
const generateEmailVerificationHTML = ({ to, firstName, lastName, verificationLink }) => {
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : to.split('@')[0];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email - InsurCheck</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280; }
            .warning { background-color: #fef3c7; color: #92400e; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .icon { font-size: 48px; margin-bottom: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="icon">📧</div>
                <h1 style="margin: 0; font-size: 28px;">Verify Your Email Address</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Complete your InsurCheck account setup</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${displayName},</h2>
                
                <p style="color: #374151; line-height: 1.6;">
                    Thank you for signing up for InsurCheck! To complete your account setup and start your 
                    <strong>7-day free trial</strong>, please verify your email address.
                </p>
                
                <p style="color: #374151; line-height: 1.6;">
                    Click the button below to verify your email address and activate your account:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" class="button">Verify Email Address</a>
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> This verification link will expire in 24 hours for security reasons. 
                    If you don't verify your email within this time, you can request a new verification link from the signup page.
                </div>
                
                <p style="color: #374151; line-height: 1.6;">
                    Once your email is verified, you'll have access to:
                </p>
                
                <ul style="color: #374151; line-height: 1.8;">
                    <li>Complete insurance management platform</li>
                    <li>Compliance tracking and reporting</li>
                    <li>Document management system</li>
                    <li>Analytics and insights dashboard</li>
                    <li>7-day free trial of all premium features</li>
                </ul>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you didn't create an account with InsurCheck, you can safely ignore this email.
                    The link will expire automatically in 24 hours.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">${verificationLink}</span>
                </p>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">
                    This verification email was sent by InsurCheck Platform<br>
                    If you need help, please contact our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate plain text email template for email verification
 */
const generateEmailVerificationText = ({ to, firstName, lastName, verificationLink }) => {
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : to.split('@')[0];
  
  return `
Verify Your Email Address - InsurCheck

Hello ${displayName},

Thank you for signing up for InsurCheck! To complete your account setup and start your 7-day free trial, please verify your email address.

Click the link below to verify your email address and activate your account:

${verificationLink}

IMPORTANT: This verification link will expire in 24 hours for security reasons. If you don't verify your email within this time, you can request a new verification link from the signup page.

Once your email is verified, you'll have access to:
- Complete insurance management platform
- Compliance tracking and reporting
- Document management system
- Analytics and insights dashboard
- 7-day free trial of all premium features

If you didn't create an account with InsurCheck, you can safely ignore this email. The link will expire automatically in 24 hours.

---
This verification email was sent by InsurCheck Platform
If you need help, please contact our support team.
  `;
};

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Password reset link
 * @param {string} firstName - User's first name
 */
const sendPasswordResetEmail = async (to, resetLink, firstName) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email service disabled - would send password reset to:', to);
      console.log('🔗 Reset link:', resetLink);
      return { success: false, reason: 'Email service not configured' };
    }

    const msg = {
      to,
      from: {
        email: 'rahul.soni@solulab.co',
        name: 'InsurCheck Security'
      },
      subject: 'InsurCheck - Password Reset Request',
      html: generatePasswordResetHTML({ to, resetLink, firstName }),
      text: generatePasswordResetText({ to, resetLink, firstName })
    };

    console.log(`📧 Sending password reset email to: ${to}`);
    console.log(`🔗 Reset link: ${resetLink}`);
    console.log(`👤 Recipient name: ${firstName || 'User'}`);
    
    const result = await sgMail.send(msg);
    
    console.log(`✅ SendGrid Response Status: ${result[0]?.statusCode}`);
    console.log(`📬 Message ID: ${result[0]?.headers['x-message-id']}`);
    console.log(`✅ Password reset email sent successfully to: ${to}`);
    
    // Return detailed response
    return { 
      success: true, 
      message: 'Password reset email sent successfully',
      messageId: result[0]?.headers['x-message-id'],
      status: result[0]?.statusCode
    };
    
  } catch (error) {
    console.error('❌ SendGrid password reset email error:', error.response?.body || error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body 
    };
  }
};

/**
 * Generate HTML email template for password reset
 */
const generatePasswordResetHTML = ({ to, resetLink, firstName }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Password Reset - InsurCheck</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
            .security-note { background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #f59e0b; }
            .footer { background-color: #f8fafc; padding: 25px 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .link-box { background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 12px; color: #475569; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: white; font-size: 32px; font-weight: bold; margin: 0;">InsurCheck</h1>
                <p style="color: #e0f2fe; margin: 5px 0 0 0;">Security Notification</p>
                <div style="margin-top: 20px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                    <h2 style="margin: 0; font-size: 24px;">Password Reset Request</h2>
                </div>
            </div>
            
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Hello ${firstName || 'User'},</h2>
                
                <p style="color: #374151; line-height: 1.6; font-size: 16px;">
                    We received a request to reset your password for your InsurCheck account. 
                    If you made this request, click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" class="button" style="color: white; text-decoration: none;">
                        Reset Your Password
                    </a>
                </div>
                
                <div class="security-note">
                    <h3 style="color: #92400e; margin-top: 0;">🔒 Security Information</h3>
                    <p style="color: #92400e; margin: 0;">
                        This link expires in 24 hours. If you didn't request this, ignore this email.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                    Can't click the button? Copy this link: <br>
                    <div class="link-box">${resetLink}</div>
                </p>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">Best regards,<br><strong style="color: #2563eb;">InsurCheck Security Team</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated message. Do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate plain text email template for password reset
 */
const generatePasswordResetText = ({ to, resetLink, firstName }) => {
  return `
Password Reset Request - InsurCheck

Hello ${firstName || 'User'},

We received a request to reset your password. Click this link to reset it:
${resetLink}

This link expires in 24 hours. If you didn't request this, ignore this email.

Best regards,
InsurCheck Security Team
  `.trim();
};

/**
 * Send audit log email with PDF attachment
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {Object} params.auditLog - Audit log data
 * @param {Buffer} params.pdfAttachment - PDF attachment buffer
 */
const sendAuditLogEmail = async ({ to, auditLog, pdfAttachment }) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Email service disabled - would send audit log to:', to);
      console.log('📋 Audit Log ID:', auditLog.id);
      return { success: false, reason: 'Email service not configured' };
    }

    const logId = auditLog.id ? String(auditLog.id).slice(0, 8) : 'Unknown';
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@insurcheck.com',
        name: 'InsurCheck Platform'
      },
      subject: `Audit Log Details - Log ID: ${logId}`,
      html: generateAuditLogHTML({ to, auditLog }),
      text: generateAuditLogText({ to, auditLog }),
      attachments: [
        {
          content: pdfAttachment.toString('base64'),
          filename: `Audit_Log_${logId}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    console.log(`📧 Sending audit log email to: ${to}`);
    console.log(`📤 Email details:`, {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      attachmentSize: pdfAttachment.length
    });
    
    const result = await sgMail.send(msg);
    
    console.log(`✅ SendGrid response:`, result[0]?.statusCode, result[0]?.headers);
    console.log(`✅ Audit log email sent successfully to: ${to}`);
    return { success: true, message: 'Audit log email sent successfully' };
    
  } catch (error) {
    console.error('❌ SendGrid audit log email error:', error.response?.body || error.message);
    return { 
      success: false, 
      error: error.message,
      details: error.response?.body 
    };
  }
};

/**
 * Send audit log email with retry logic
 */
const sendAuditLogEmailWithRetry = async (params) => {
  return retryEmailDelivery(sendAuditLogEmail, params, 3);
};

/**
 * Generate HTML email template for audit log
 */
const generateAuditLogHTML = ({ to, auditLog }) => {
  const logId = auditLog.id ? String(auditLog.id).slice(0, 8) : 'Unknown';
  const timestamp = auditLog.createdAt ? new Date(auditLog.createdAt).toLocaleString() : 'N/A';
  const details = typeof auditLog.details === 'object' ? JSON.stringify(auditLog.details, null, 2) : (auditLog.details || 'No details available');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Audit Log Details - InsurCheck</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table th { background-color: #f8fafc; color: #374151; padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: 600; }
            .info-table td { padding: 12px; border: 1px solid #e5e7eb; color: #6b7280; }
            .details-box { background-color: #f9fafb; border: 1px solid #d1d5db; border-radius: 6px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 12px; color: #374151; white-space: pre-wrap; }
            .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 14px; color: #6b7280; }
            .attachment-note { background-color: #eff6ff; color: #1d4ed8; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 28px;">InsurCheck Audit Log</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Activity Record Details</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Audit Log Details</h2>
                
                <p style="color: #374151; line-height: 1.6;">
                    Please find below the details of the requested audit log entry. A PDF attachment with complete information is also included for your records.
                </p>
                
                <table class="info-table">
                    <tr>
                        <th>Log ID</th>
                        <td>${logId}</td>
                    </tr>
                    <tr>
                        <th>Action</th>
                        <td>${auditLog.action || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <th>Resource</th>
                        <td>${auditLog.resource || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Resource ID</th>
                        <td>${auditLog.resourceId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Level</th>
                        <td>${auditLog.level || 'info'}</td>
                    </tr>
                    <tr>
                        <th>Timestamp</th>
                        <td>${timestamp}</td>
                    </tr>
                    <tr>
                        <th>IP Address</th>
                        <td>${auditLog.ipAddress || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>User Agent</th>
                        <td style="word-break: break-all;">${auditLog.userAgent || 'N/A'}</td>
                    </tr>
                </table>
                
                <h3 style="color: #1f2937;">Additional Details</h3>
                <div class="details-box">${details}</div>
                
                <div class="attachment-note">
                    <strong>📎 PDF Attachment:</strong> A complete PDF report of this audit log has been attached to this email for your records.
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0;">
                    This audit log was sent by InsurCheck Platform<br>
                    Generated on ${new Date().toLocaleString()}
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate plain text email template for audit log
 */
const generateAuditLogText = ({ to, auditLog }) => {
  const logId = auditLog.id ? String(auditLog.id).slice(0, 8) : 'Unknown';
  const timestamp = auditLog.createdAt ? new Date(auditLog.createdAt).toLocaleString() : 'N/A';
  const details = typeof auditLog.details === 'object' ? JSON.stringify(auditLog.details, null, 2) : (auditLog.details || 'No details available');

  return `
InsurCheck - Audit Log Details

Log ID: ${logId}
Action: ${auditLog.action || 'Unknown'}
Resource: ${auditLog.resource || 'N/A'}
Resource ID: ${auditLog.resourceId || 'N/A'}
Level: ${auditLog.level || 'info'}
Timestamp: ${timestamp}
IP Address: ${auditLog.ipAddress || 'N/A'}
User Agent: ${auditLog.userAgent || 'N/A'}

Additional Details:
${details}

A PDF attachment with complete information is also included for your records.

---
This audit log was sent by InsurCheck Platform
Generated on ${new Date().toLocaleString()}
  `;
};

export {
  initializeEmailService,
  sendTenantAdminInvitation,
  sendUserInvitation,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendAuditLogEmailWithRetry,
  retryEmailDelivery
};