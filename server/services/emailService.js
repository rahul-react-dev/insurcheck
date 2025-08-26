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
        email: process.env.SENDGRID_FROM_EMAIL || 'rahul.soni@solulab.co',
        name: 'InsurCheck Platform'
      },
      subject: `Welcome to InsurCheck - Complete Your Account Setup`,
      html: generateInvitationHTML({ to, tenantName, setupLink, invitedBy }),
      text: generateInvitationText({ to, tenantName, setupLink, invitedBy })
    };

    await sgMail.send(msg);
    
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

export {
  initializeEmailService,
  sendTenantAdminInvitation
};