import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../store/authSlice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password && formData.role) {
      dispatch(loginRequest(formData));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const roles = [
    {
      id: 'super-admin',
      value: 'super-admin',
      title: 'Super Admin',
      description: 'Full platform access',
      icon: 'fas fa-crown',
      color: 'bg-blue-500'
    },
    {
      id: 'tenant-admin', 
      value: 'tenant-admin',
      title: 'Tenant Admin',
      description: 'Organization management',
      icon: 'fas fa-user-tie',
      color: 'bg-cyan-500'
    },
    {
      id: 'user',
      value: 'user', 
      title: 'User',
      description: 'Standard access',
      icon: 'fas fa-user',
      color: 'bg-green-500'
    }
  ];

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

        {/* Login Form Card */}
        <Card className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-800">Select Your Role</label>
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => (
                <div key={role.id} className="relative">
                  <input
                    type="radio"
                    name="role"
                    id={role.id}
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={() => handleRoleChange(role.value)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={role.id}
                    className="flex items-center justify-between p-4 bg-gray-50 border-2 border-transparent rounded-xl cursor-pointer hover:bg-blue-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${role.color} rounded-lg`}>
                        <i className={`${role.icon} text-white text-sm`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{role.title}</h3>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 border-2 border-gray-400 rounded-full peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400 text-sm"></i>
                </div>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400 text-sm"></i>
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 text-sm hover:text-gray-600 transition-colors duration-200`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-500 border-gray-200 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-500">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors duration-200">
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password || !formData.role}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-white gradient-secondary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <i className="fas fa-arrow-right ml-2 text-sm"></i>
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <i className="fab fa-google text-red-500 mr-2"></i>
              <span className="text-sm font-medium">Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <i className="fab fa-microsoft text-blue-600 mr-2"></i>
              <span className="text-sm font-medium">Microsoft</span>
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-100 text-xs">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-white hover:text-blue-200 transition-colors duration-200">
              Contact your administrator
            </a>
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4 text-blue-200 text-xs">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
