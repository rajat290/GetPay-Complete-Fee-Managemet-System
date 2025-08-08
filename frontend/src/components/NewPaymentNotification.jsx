import { useState, useEffect } from "react";
import { FiX, FiDollarSign } from "react-icons/fi";

export default function NewPaymentNotification({ isVisible, payment, onClose }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && payment) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, payment, onClose]);

  if (!isVisible || !payment) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">New Payment Received!</p>
            <p className="text-sm text-gray-500 mt-1">
              {payment.student} - {formatCurrency(payment.amount)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {payment.type} • {new Date(payment.date).toLocaleTimeString()}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
