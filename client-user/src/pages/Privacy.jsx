import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Main Container - constrains max width on ultrawide screens */}
      <div className="max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                InsurCheck
              </span>
            </Link>
            
            <Link to="/signup">
              <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 lg:p-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last updated: September 10, 2024
            </p>
          </div>

          <div className="prose prose-blue max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support.
            </p>
            
            <h3>Personal Information</h3>
            <ul>
              <li>Name and contact information</li>
              <li>Email address and phone number</li>
              <li>Company name and professional details</li>
              <li>Account credentials and preferences</li>
            </ul>

            <h3>Usage Information</h3>
            <ul>
              <li>Information about how you use our service</li>
              <li>Log data including IP addresses and browser information</li>
              <li>Device information and operating system details</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy:
            </p>
            <ul>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With your explicit consent</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <h3>Security Measures</h3>
            <ul>
              <li>End-to-end encryption for data transmission</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication options</li>
              <li>SOC 2 Type II compliance</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services 
              and fulfill the purposes described in this policy, unless a longer retention period 
              is required by law.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data in a portable format</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to improve your experience, analyze usage, 
              and personalize content. You can control cookie settings through your browser preferences.
            </p>

            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your information.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
              <br />
              Email: privacy@insurcheck.com
              <br />
              Phone: 1-800-INSURCHECK
              <br />
              Address: InsurCheck Privacy Team, 123 Business Ave, Suite 100, Business City, BC 12345
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Back to Sign Up
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default Privacy;