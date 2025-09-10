// Email service for sending invitations and notifications
// This is a placeholder implementation - in production, integrate with SendGrid, SES, etc.

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log(`📧 Email Service: Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    
    // TODO: Implement actual email sending
    // For now, just log the email content
    console.log('Email Content:');
    console.log(text || html);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`✅ Email sent successfully to ${to}`);
    return { success: true, messageId: 'mock-message-id' };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendInvitationEmail = async (email, firstName, tempPassword) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to InsurCheck - Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to InsurCheck!</h2>
        <p>Hello ${firstName},</p>
        <p>Your account has been created by your administrator. Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p><strong>Important:</strong> Please log in and change your password immediately for security.</p>
        <p>You can access your account at the admin login page.</p>
        <p>Best regards,<br><strong>InsurCheck Team</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email, resetLink, firstName) => {
  return sendEmail({
    to: email,
    subject: 'InsurCheck - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 32px; font-weight: bold;">InsurCheck</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Secure Insurance Management</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 24px;">Password Reset Request</h2>
          <p style="color: #e0f2fe; margin: 0; font-size: 16px;">We received a request to reset your password</p>
        </div>
        
        <div style="margin: 30px 0;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello ${firstName},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset the password for your InsurCheck account. If you made this request, 
            click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                      transition: all 0.2s ease;">
              Reset Your Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
            <strong>Security Note:</strong> This link will expire in 24 hours for your security. 
            If you didn't request this password reset, you can safely ignore this email.
          </p>
          
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
              <span style="word-break: break-all; font-family: monospace; font-size: 12px;">${resetLink}</span>
            </p>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">
            Best regards,<br>
            <strong style="color: #2563eb;">The InsurCheck Team</strong>
          </p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.4;">
              This is an automated security notification from InsurCheck. Please do not reply to this email. 
              If you have questions, contact our support team. For security reasons, password reset links expire after 24 hours.
            </p>
          </div>
        </div>
      </div>
    `
  });
};