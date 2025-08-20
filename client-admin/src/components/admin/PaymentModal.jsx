import { useState } from 'react';
import { X, CreditCard, Lock, Shield, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  onProcessPayment,
  isLoading 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !invoice) return null;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Validate card details
  const validateCardDetails = () => {
    const newErrors = {};

    if (!cardDetails.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardDetails.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!cardDetails.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Please enter date in MM/YY format';
    }

    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    return newErrors;
  };

  // Validate bank details
  const validateBankDetails = () => {
    const newErrors = {};

    if (!bankDetails.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (bankDetails.accountNumber.length < 8) {
      newErrors.accountNumber = 'Please enter a valid account number';
    }

    if (!bankDetails.routingNumber) {
      newErrors.routingNumber = 'Routing number is required';
    } else if (!/^\d{9}$/.test(bankDetails.routingNumber)) {
      newErrors.routingNumber = 'Routing number must be 9 digits';
    }

    if (!bankDetails.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    let validationErrors = {};
    if (paymentMethod === 'credit_card') {
      validationErrors = validateCardDetails();
    } else if (paymentMethod === 'bank_transfer') {
      validationErrors = validateBankDetails();
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsProcessing(true);

    const paymentData = {
      paymentMethod,
      amount: invoice.amount,
      ...(paymentMethod === 'credit_card' ? cardDetails : bankDetails)
    };

    onProcessPayment(paymentData);
  };

  // Handle card number formatting
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    if (value.length <= 19) { // 16 digits + 3 spaces
      setCardDetails(prev => ({ ...prev, cardNumber: value }));
    }
  };

  // Handle expiry date formatting
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  };

  // Handle CVV change
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCardDetails(prev => ({ ...prev, cvv: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Processing
              </h3>
              <button
                onClick={onClose}
                disabled={isLoading || isProcessing}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {/* Invoice Summary */}
            <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice:</span>
                  <span className="font-medium">#{invoice.invoiceNumber || invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                </div>
                <div className="flex justify-between text-lg border-t border-blue-200 pt-2 mt-2">
                  <span className="font-medium text-gray-900">Total Amount:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </Card>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <input
                      type="radio"
                      id="credit_card"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="credit_card"
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'credit_card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Credit Card</p>
                          <p className="text-sm text-gray-600">Pay with Visa, Mastercard, or American Express</p>
                        </div>
                      </div>
                      {paymentMethod === 'credit_card' && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="bank_transfer"
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 text-gray-600">🏦</div>
                        <div>
                          <p className="font-medium text-gray-900">Bank Transfer</p>
                          <p className="text-sm text-gray-600">Direct transfer from your bank account</p>
                        </div>
                      </div>
                      {paymentMethod === 'bank_transfer' && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Credit Card Details */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <Input
                      type="text"
                      value={cardDetails.cardholderName}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                      placeholder="Full name on card"
                      className={errors.cardholderName ? 'border-red-500' : ''}
                    />
                    {errors.cardholderName && (
                      <p className="text-red-600 text-sm mt-1">{errors.cardholderName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <Input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className={errors.cardNumber ? 'border-red-500' : ''}
                    />
                    {errors.cardNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <Input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={handleExpiryDateChange}
                        placeholder="MM/YY"
                        className={errors.expiryDate ? 'border-red-500' : ''}
                      />
                      {errors.expiryDate && (
                        <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <Input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        className={errors.cvv ? 'border-red-500' : ''}
                      />
                      {errors.cvv && (
                        <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Details */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Holder Name
                    </label>
                    <Input
                      type="text"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      placeholder="Full name on account"
                      className={errors.accountHolderName ? 'border-red-500' : ''}
                    />
                    {errors.accountHolderName && (
                      <p className="text-red-600 text-sm mt-1">{errors.accountHolderName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <Input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Account number"
                      className={errors.accountNumber ? 'border-red-500' : ''}
                    />
                    {errors.accountNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <Input
                      type="text"
                      value={bankDetails.routingNumber}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value.replace(/\D/g, '') }))}
                      placeholder="9-digit routing number"
                      className={errors.routingNumber ? 'border-red-500' : ''}
                    />
                    {errors.routingNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.routingNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-green-900 mb-1">Secure Payment</h5>
                    <p className="text-sm text-green-700">
                      Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || isProcessing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {(isLoading || isProcessing) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay {formatCurrency(invoice.amount)}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading || isProcessing}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;