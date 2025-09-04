import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../../hooks/use-toast';

// Load Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '::placeholder': {
        color: '#9CA3AF',
      },
      iconColor: '#6B7280',
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
  },
  hidePostalCode: false,
};

// Payment form component
const PaymentForm = ({ 
  clientSecret, 
  amount, 
  currentPlan, 
  newPlan, 
  onSuccess, 
  onError, 
  onCancel,
  isProcessing,
  setIsProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !cardComplete) {
      return;
    }

    setIsProcessing(true);
    setCardError('');

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        console.error('Payment failed:', result.error);
        setCardError(result.error.message);
        onError(result.error.message);
        toast({
          title: 'Payment Failed',
          description: result.error.message,
          variant: 'destructive'
        });
      } else {
        console.log('Payment succeeded:', result.paymentIntent);
        console.log('🔍 Starting payment verification process...');
        
        // Pass payment intent for verification
        toast({
          title: 'Payment Successful!',
          description: 'Verifying payment and updating subscription...',
          variant: 'default'
        });
        
        onSuccess(result.paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setCardError(errorMessage);
      onError(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
          Payment Summary
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Plan:</span>
            <span className="font-medium">{currentPlan.name} ({formatPrice(currentPlan.price)}/month)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">New Plan:</span>
            <span className="font-medium text-blue-600">{newPlan.name} ({formatPrice(newPlan.price)}/month)</span>
          </div>
          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Prorated Amount Due:</span>
              <span className="font-bold text-lg text-green-600">{formatPrice(amount / 100)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="relative">
          <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement
              options={cardElementOptions}
              onChange={handleCardChange}
            />
          </div>
          {cardError && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {cardError}
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <Lock className="w-4 h-4 mt-0.5 text-gray-500" />
        <div>
          <p className="font-medium">Secure Payment</p>
          <p>Your payment information is encrypted and processed securely by Stripe.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          data-testid="button-cancel-payment"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!cardComplete || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          data-testid="button-confirm-payment"
        >
          {isProcessing ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Pay {formatPrice(amount / 100)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Main modal component
const StripePaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentData,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't render if not open or no payment data
  if (!isOpen || !paymentData) return null;

  const { clientSecret, amount, currentPlan, newPlan } = paymentData;

  const handleSuccess = (paymentIntent) => {
    setIsProcessing(false);
    onPaymentSuccess(paymentIntent);
    onClose();
  };

  const handleError = (error) => {
    setIsProcessing(false);
    onPaymentError(error);
  };

  const handleCancel = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Upgrade Subscription
          </h3>
          {!isProcessing && (
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
              data-testid="button-close-payment-modal"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              currentPlan={currentPlan}
              newPlan={newPlan}
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={handleCancel}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;