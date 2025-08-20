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