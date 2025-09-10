import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const Terms = () => {
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
              Terms and Conditions
            </h1>
            <p className="text-gray-600">
              Last updated: September 10, 2024
            </p>
          </div>

          <div className="prose prose-blue max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using InsurCheck's services, you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              InsurCheck provides a comprehensive insurance management platform designed to help organizations 
              manage documents, ensure compliance, and streamline insurance operations.
            </p>

            <h2>3. Free Trial</h2>
            <p>
              We offer a 7-day free trial period for new users. During this trial period, you have access to 
              all premium features. No credit card is required to start your trial.
            </p>

            <h2>4. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. Please notify us immediately of any unauthorized use 
              of your account.
            </p>

            <h2>5. Data Security and Privacy</h2>
            <p>
              We take data security seriously and implement industry-standard security measures to protect 
              your information. Please refer to our Privacy Policy for detailed information about how we 
              collect, use, and protect your data.
            </p>

            <h2>6. Acceptable Use</h2>
            <p>
              You agree to use our service only for lawful purposes and in accordance with these terms. 
              You may not use our service to:
            </p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload malicious code or attempt to disrupt our service</li>
              <li>Share your account with unauthorized users</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of InsurCheck are owned by us and are protected by 
              copyright, trademark, and other intellectual property laws.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, InsurCheck shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of our service.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for violations of these terms or for 
              any other reason at our sole discretion.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes via email or through our service.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
              <br />
              Email: legal@insurcheck.com
              <br />
              Phone: 1-800-INSURCHECK
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

export default Terms;