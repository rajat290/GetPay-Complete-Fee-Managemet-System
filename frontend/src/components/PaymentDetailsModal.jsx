import { useState, useEffect } from "react";
import { FiX, FiDownload, FiMail } from "react-icons/fi";
import api from "../services/api";

export default function PaymentDetailsModal({ paymentId, isOpen, onClose }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentId) {
      fetchPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/payments/${paymentId}`);
      setPayment(response.data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await api.get(`/payments/receipt/${paymentId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-${payment.paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : payment ? (
            <div className="space-y-6">
              {/* Payment ID and Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{payment.paymentId}</h3>
                  <p className="text-sm text-gray-500">Payment ID</p>
                </div>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${getStatusDot(payment.status)} mr-2`}></div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status === 'completed' ? 'Paid' : payment.status === 'pending' ? 'Pending' : 'Failed'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Student Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">{payment.student.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Registration No</p>
                      <p className="text-sm font-medium text-gray-900">{payment.student.registrationNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Class</p>
                      <p className="text-sm font-medium text-gray-900">{payment.student.className}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{payment.student.email}</p>
                    </div>
                  </div>
                </div>

                {/* Fee Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Fee Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Fee Type</p>
                      <p className="text-sm font-medium text-gray-900">{payment.fee.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm font-medium text-gray-900">{payment.fee.description || 'No description'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Mode</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{payment.mode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Transaction Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Razorpay Transaction ID</span>
                    <span className="text-sm font-medium text-gray-900">{payment.razorpayTransactionId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Razorpay Order ID</span>
                    <span className="text-sm font-medium text-gray-900">{payment.razorpayOrderId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(payment.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                {payment.status === 'completed' && (
                  <>
                    <button
                      onClick={handleDownloadReceipt}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiDownload className="h-4 w-4 mr-2" />
                      Download Receipt
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      <FiMail className="h-4 w-4 mr-2" />
                      Resend Email
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Payment details not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
