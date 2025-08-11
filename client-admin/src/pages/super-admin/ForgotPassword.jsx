
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">InsurCheck</h1>
          <p className="text-blue-200">Super Admin Portal</p>
        </div>

        <Card className="p-8 shadow-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Forgot Password
            </h2>
            <p className="text-gray-600 mb-6">
              This feature is coming soon. Please contact your system administrator for password reset assistance.
            </p>
            <Button
              onClick={() => navigate('/super-admin/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
