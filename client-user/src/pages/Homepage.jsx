import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Users, TrendingUp, CheckCircle, ArrowRight, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/use-toast';
import { cn } from '../utils/cn';

const Homepage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleTrialSignup = () => {
    if (isAuthenticated) {
      toast({
        type: 'info',
        title: 'Already Logged In',
        description: 'You are already signed in to your account.',
      });
      return;
    }
    navigate('/signup');
  };

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption and compliance.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamlessly work with your team on insurance documents and policies.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Get insights into your insurance portfolio with powerful analytics.',
    },
  ];

  const benefits = [
    'Complete document management system',
    'Automated compliance checking', 
    'Real-time collaboration tools',
    'Advanced reporting & analytics',
    'Mobile-responsive interface',
    '24/7 customer support',
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Insurance Manager',
      company: 'SecureLife Insurance',
      content: 'InsurCheck transformed how we manage our documents. The 7-day trial convinced us immediately.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Compliance Officer',
      company: 'TrustGuard Solutions',
      content: 'The compliance features are outstanding. We saw 40% improvement in our audit processes.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Main Container - constrains max width on ultrawide screens */}
      <div className="max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                InsurCheck
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTrialSignup}
                    data-testid="header-trial-button"
                  >
                    Start Free Trial
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Welcome, {user?.firstName}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    data-testid="dashboard-button"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Insurance Management
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Streamline your insurance operations with our comprehensive platform. 
                Manage documents, ensure compliance, and boost productivity with advanced analytics.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              {!isAuthenticated && (
                <Button
                  variant="primary"
                  size="xl"
                  icon={<Sparkles className="h-5 w-5" />}
                  onClick={handleTrialSignup}
                  className="min-w-[280px]"
                  data-testid="hero-trial-button"
                >
                  Start Your 7-Day Free Trial
                </Button>
              )}
              <Button
                variant="outline"
                size="xl"
                icon={<ArrowRight className="h-5 w-5" />}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="min-w-[200px]"
                data-testid="learn-more-button"
              >
                Learn More
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-500"
            >
              ✨ No credit card required • 🚀 Setup in 2 minutes • 🔒 Enterprise-grade security
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Insurance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your insurance operations efficiently and securely.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="text-center p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Why Choose InsurCheck?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Join thousands of insurance professionals who trust InsurCheck to streamline their operations.
              </p>
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="lg:text-center">
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
                  <p className="text-blue-100 mb-6">
                    Experience the power of InsurCheck with our comprehensive 7-day free trial.
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleTrialSignup}
                    className="w-full bg-white text-blue-600 hover:bg-gray-50"
                    data-testid="benefits-trial-button"
                  >
                    Start Free Trial Now
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Insurance Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their experience with InsurCheck.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">InsurCheck</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 InsurCheck. All rights reserved.</p>
              <p className="text-sm text-gray-500 mt-1">Secure • Reliable • Professional</p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Homepage;