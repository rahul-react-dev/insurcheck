import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    if (role === 'super-admin') {
      navigate('/super-admin/login');
    } else if (role === 'tenant-admin') {
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <i className="fas fa-shield-alt text-blue-600 text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">InsurCheck</h1>
          <p className="text-blue-100 text-sm font-medium">Professional Insurance Management Platform</p>
        </div>

        {/* Role Selection Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select Your Role</h2>
            <p className="text-gray-500 text-sm">Choose your access level to continue</p>
          </div>

          {/* Role Options */}
          <div className="space-y-4">
            {/* Super Admin Option */}
            <button
              onClick={() => handleRoleSelection('super-admin')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 border-2 border-transparent rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-200">
                  <i className="fas fa-crown text-white text-sm"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 text-sm">Super Admin</h3>
                  <p className="text-xs text-gray-500">Full platform access</p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 transition-colors duration-200"></i>
            </button>

            {/* Tenant Admin Option */}
            <button
              onClick={() => handleRoleSelection('tenant-admin')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 border-2 border-transparent rounded-xl hover:bg-blue-50 hover:border-blue-500 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-500 rounded-lg group-hover:bg-cyan-600 transition-colors duration-200">
                  <i className="fas fa-user-tie text-white text-sm"></i>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 text-sm">Tenant Admin</h3>
                  <p className="text-xs text-gray-500">Organization management</p>
                </div>
              </div>
              <i className="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 transition-colors duration-200"></i>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-100 text-xs">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-white hover:text-blue-200 transition-colors duration-200">
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;