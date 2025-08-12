import React, { useState } from "react";
import Button from "../ui/Button";

const InvoiceTable = ({
  // invoices = [],
  isLoading = false,
  onViewInvoice,
  onDownloadInvoice,
  onMarkPaid,
  pagination = { page: 1, limit: 10, total: 0 },
  totalInvoices = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const invoices = [
    {
      id: "1",
      invoiceId: "INV-2024-001",
      tenantName: "Acme Insurance Co.",
      tenantEmail: "admin@acme-insurance.com",
      tenantCompany: "Acme Insurance Co.",
      tenantPhone: "+1 (555) 123-4567",
      tenantAddress: "123 Main St, New York, NY 10001",
      amount: 299.99,
      planName: "Enterprise Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-01",
      dueDate: "2024-01-31",
      status: "paid",
      paidDate: "2024-01-15",
      breakdown: [
        { description: "Enterprise Plan - Monthly", amount: 299.99 },
        { description: "Tax", amount: 0 },
      ],
      paymentHistory: [
        { type: "Credit Card Payment", date: "2024-01-15", amount: 299.99 },
      ],
      notes: "Payment processed successfully via credit card.",
    },
    {
      id: "2",
      invoiceId: "INV-2024-002",
      tenantName: "SafeGuard Insurance",
      tenantEmail: "billing@safeguard.com",
      tenantCompany: "SafeGuard Insurance Ltd.",
      tenantPhone: "+1 (555) 987-6543",
      tenantAddress: "456 Oak Avenue, Chicago, IL 60601",
      amount: 99.99,
      planName: "Professional Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-01",
      dueDate: "2024-01-31",
      status: "pending",
      breakdown: [
        { description: "Professional Plan - Monthly", amount: 99.99 },
        { description: "Tax", amount: 0 },
      ],
      notes: "Awaiting payment processing.",
    },
    {
      id: "3",
      invoiceId: "INV-2024-003",
      tenantName: "Quick Insurance",
      tenantEmail: "finance@quickinsurance.com",
      tenantCompany: "Quick Insurance Inc.",
      tenantPhone: "+1 (555) 456-7890",
      tenantAddress: "789 Pine Street, Los Angeles, CA 90210",
      amount: 29.99,
      planName: "Basic Plan",
      billingPeriod: "Monthly",
      issueDate: "2023-12-01",
      dueDate: "2023-12-31",
      status: "overdue",
      breakdown: [{ description: "Basic Plan - Monthly", amount: 29.99 }],
      notes: "Payment overdue. Follow-up required.",
    },
    {
      id: "4",
      invoiceId: "INV-2024-004",
      tenantName: "Premium Insurance Group",
      tenantEmail: "accounts@premium.com",
      tenantCompany: "Premium Insurance Group LLC",
      tenantPhone: "+1 (555) 321-0987",
      tenantAddress: "321 Elm Drive, Miami, FL 33101",
      amount: 499.99,
      planName: "Enterprise Pro Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-15",
      dueDate: "2024-02-15",
      status: "pending",
      breakdown: [
        { description: "Enterprise Pro Plan - Monthly", amount: 499.99 },
        { description: "Tax", amount: 0 },
      ],
      notes: "New premium plan subscription.",
    },
    {
      id: "5",
      invoiceId: "INV-2024-005",
      tenantName: "Reliable Insurance",
      tenantEmail: "billing@reliable.com",
      tenantCompany: "Reliable Insurance Corp.",
      tenantPhone: "+1 (555) 654-3210",
      tenantAddress: "654 Maple Lane, Seattle, WA 98101",
      amount: 149.99,
      planName: "Professional Plus Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-10",
      dueDate: "2024-02-10",
      status: "paid",
      paidDate: "2024-01-20",
      breakdown: [
        { description: "Professional Plus Plan - Monthly", amount: 149.99 },
        { description: "Tax", amount: 0 },
      ],
      paymentHistory: [
        { type: "Bank Transfer", date: "2024-01-20", amount: 149.99 },
      ],
      notes: "Payment received via bank transfer.",
    },
    {
      id: "6",
      invoiceId: "INV-2024-006",
      tenantName: "SecureLife Insurance",
      tenantEmail: "finance@securelife.com",
      tenantCompany: "SecureLife Insurance Inc.",
      tenantPhone: "+1 (555) 789-0123",
      tenantAddress: "987 Cedar Court, Boston, MA 02101",
      amount: 199.99,
      planName: "Professional Plan",
      billingPeriod: "Monthly",
      issueDate: "2023-11-15",
      dueDate: "2023-12-15",
      status: "overdue",
      breakdown: [
        { description: "Professional Plan - Monthly", amount: 199.99 },
      ],
      notes: "Multiple payment reminders sent. Urgent follow-up required.",
    },
    {
      id: "7",
      invoiceId: "INV-2024-007",
      tenantName: "TrustGuard Insurance",
      tenantEmail: "billing@trustguard.com",
      tenantCompany: "TrustGuard Insurance LLC",
      tenantPhone: "+1 (555) 111-2222",
      tenantAddress: "111 Oak Street, Denver, CO 80201",
      amount: 399.99,
      planName: "Enterprise Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-20",
      dueDate: "2024-02-20",
      status: "pending",
      breakdown: [{ description: "Enterprise Plan - Monthly", amount: 399.99 }],
      notes: "New enterprise customer.",
    },
    {
      id: "8",
      invoiceId: "INV-2024-008",
      tenantName: "Shield Insurance Co.",
      tenantEmail: "accounts@shield.com",
      tenantCompany: "Shield Insurance Co.",
      tenantPhone: "+1 (555) 333-4444",
      tenantAddress: "333 Pine Avenue, Portland, OR 97201",
      amount: 79.99,
      planName: "Basic Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-25",
      dueDate: "2024-02-25",
      status: "paid",
      paidDate: "2024-01-28",
      breakdown: [{ description: "Basic Plan - Monthly", amount: 79.99 }],
      paymentHistory: [
        { type: "Credit Card Payment", date: "2024-01-28", amount: 79.99 },
      ],
      notes: "Quick payment processing.",
    },
    {
      id: "9",
      invoiceId: "INV-2024-009",
      tenantName: "Fortress Insurance",
      tenantEmail: "finance@fortress.com",
      tenantCompany: "Fortress Insurance Group",
      tenantPhone: "+1 (555) 555-6666",
      tenantAddress: "555 Maple Drive, Austin, TX 73301",
      amount: 249.99,
      planName: "Professional Plus Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-01-30",
      dueDate: "2024-02-28",
      status: "pending",
      breakdown: [
        { description: "Professional Plus Plan - Monthly", amount: 249.99 },
      ],
      notes: "Mid-tier plan subscription.",
    },
    {
      id: "10",
      invoiceId: "INV-2024-010",
      tenantName: "Guardian Insurance",
      tenantEmail: "billing@guardian.com",
      tenantCompany: "Guardian Insurance Ltd.",
      tenantPhone: "+1 (555) 777-8888",
      tenantAddress: "777 Birch Lane, Phoenix, AZ 85001",
      amount: 59.99,
      planName: "Basic Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-02-01",
      dueDate: "2024-03-01",
      status: "pending",
      breakdown: [{ description: "Basic Plan - Monthly", amount: 59.99 }],
      notes: "New basic plan customer.",
    },
    {
      id: "11",
      invoiceId: "INV-2024-011",
      tenantName: "Pinnacle Insurance",
      tenantEmail: "accounts@pinnacle.com",
      tenantCompany: "Pinnacle Insurance Corp.",
      tenantPhone: "+1 (555) 999-0000",
      tenantAddress: "999 Willow Street, San Diego, CA 92101",
      amount: 599.99,
      planName: "Enterprise Pro Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-02-05",
      dueDate: "2024-03-05",
      status: "paid",
      paidDate: "2024-02-10",
      breakdown: [
        { description: "Enterprise Pro Plan - Monthly", amount: 599.99 },
      ],
      paymentHistory: [
        { type: "Bank Transfer", date: "2024-02-10", amount: 599.99 },
      ],
      notes: "Premium plan with early payment.",
    },
    {
      id: "12",
      invoiceId: "INV-2024-012",
      tenantName: "Valor Insurance",
      tenantEmail: "finance@valor.com",
      tenantCompany: "Valor Insurance Inc.",
      tenantPhone: "+1 (555) 123-9876",
      tenantAddress: "123 Spruce Court, Nashville, TN 37201",
      amount: 179.99,
      planName: "Professional Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-02-10",
      dueDate: "2024-03-10",
      status: "pending",
      breakdown: [
        { description: "Professional Plan - Monthly", amount: 179.99 },
      ],
      notes: "Professional tier subscription.",
    },
    {
      id: "13",
      invoiceId: "INV-2024-013",
      tenantName: "Summit Insurance",
      tenantEmail: "accounts@summit.com",
      tenantCompany: "Summit Insurance LLC",
      tenantPhone: "+1 (555) 234-5678",
      tenantAddress: "234 Ridge Road, Atlanta, GA 30301",
      amount: 129.99,
      planName: "Professional Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-02-15",
      dueDate: "2024-03-15",
      status: "pending",
      breakdown: [
        { description: "Professional Plan - Monthly", amount: 129.99 },
      ],
      notes: "New professional subscription.",
    },
    {
      id: "14",
      invoiceId: "INV-2024-014",
      tenantName: "Apex Insurance Group",
      tenantEmail: "billing@apex.com",
      tenantCompany: "Apex Insurance Group Inc.",
      tenantPhone: "+1 (555) 345-6789",
      tenantAddress: "345 Valley Street, Dallas, TX 75201",
      amount: 89.99,
      planName: "Basic Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-02-20",
      dueDate: "2024-03-20",
      status: "paid",
      paidDate: "2024-02-22",
      breakdown: [{ description: "Basic Plan - Monthly", amount: 89.99 }],
      paymentHistory: [
        { type: "Credit Card Payment", date: "2024-02-22", amount: 89.99 },
      ],
      notes: "Quick payment via credit card.",
    },
    {
      id: "15",
      invoiceId: "INV-2024-015",
      tenantName: "Elite Insurance Co.",
      tenantEmail: "finance@elite.com",
      tenantCompany: "Elite Insurance Co.",
      tenantPhone: "+1 (555) 456-7890",
      tenantAddress: "456 Crown Avenue, Las Vegas, NV 89101",
      amount: 449.99,
      planName: "Enterprise Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-02-25",
      dueDate: "2024-03-25",
      status: "overdue",
      breakdown: [{ description: "Enterprise Plan - Monthly", amount: 449.99 }],
      notes: "Payment overdue - follow up required.",
    },
    {
      id: "16",
      invoiceId: "INV-2024-016",
      tenantName: "Prime Insurance Ltd.",
      tenantEmail: "accounts@prime.com",
      tenantCompany: "Prime Insurance Ltd.",
      tenantPhone: "+1 (555) 567-8901",
      tenantAddress: "567 Park Lane, San Francisco, CA 94101",
      amount: 199.99,
      planName: "Professional Plus Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-03-01",
      dueDate: "2024-03-31",
      status: "pending",
      breakdown: [
        { description: "Professional Plus Plan - Monthly", amount: 199.99 },
      ],
      notes: "Professional plus tier subscription.",
    },
    {
      id: "17",
      invoiceId: "INV-2024-017",
      tenantName: "Nova Insurance",
      tenantEmail: "billing@nova.com",
      tenantCompany: "Nova Insurance Corp.",
      tenantPhone: "+1 (555) 678-9012",
      tenantAddress: "678 Star Drive, Orlando, FL 32801",
      amount: 69.99,
      planName: "Basic Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-03-05",
      dueDate: "2024-04-05",
      status: "paid",
      paidDate: "2024-03-08",
      breakdown: [{ description: "Basic Plan - Monthly", amount: 69.99 }],
      paymentHistory: [
        { type: "Bank Transfer", date: "2024-03-08", amount: 69.99 },
      ],
      notes: "Payment via bank transfer.",
    },
    {
      id: "18",
      invoiceId: "INV-2024-018",
      tenantName: "Zenith Insurance",
      tenantEmail: "finance@zenith.com",
      tenantCompany: "Zenith Insurance Group",
      tenantPhone: "+1 (555) 789-0123",
      tenantAddress: "789 Summit Court, Philadelphia, PA 19101",
      amount: 349.99,
      planName: "Enterprise Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-03-10",
      dueDate: "2024-04-10",
      status: "pending",
      breakdown: [{ description: "Enterprise Plan - Monthly", amount: 349.99 }],
      notes: "Enterprise tier subscription.",
    },
    {
      id: "19",
      invoiceId: "INV-2024-019",
      tenantName: "Stellar Insurance",
      tenantEmail: "accounts@stellar.com",
      tenantCompany: "Stellar Insurance Inc.",
      tenantPhone: "+1 (555) 890-1234",
      tenantAddress: "890 Galaxy Boulevard, Houston, TX 77001",
      amount: 159.99,
      planName: "Professional Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-03-15",
      dueDate: "2024-04-15",
      status: "paid",
      paidDate: "2024-03-18",
      breakdown: [
        { description: "Professional Plan - Monthly", amount: 159.99 },
      ],
      paymentHistory: [
        { type: "Credit Card Payment", date: "2024-03-18", amount: 159.99 },
      ],
      notes: "Timely payment processing.",
    },
    {
      id: "20",
      invoiceId: "INV-2024-020",
      tenantName: "Quantum Insurance",
      tenantEmail: "billing@quantum.com",
      tenantCompany: "Quantum Insurance LLC",
      tenantPhone: "+1 (555) 901-2345",
      tenantAddress: "901 Future Street, San Jose, CA 95101",
      amount: 279.99,
      planName: "Professional Plus Plan",
      billingPeriod: "Monthly",
      issueDate: "2024-03-20",
      dueDate: "2024-04-20",
      status: "pending",
      breakdown: [
        { description: "Professional Plus Plan - Monthly", amount: 279.99 },
      ],
      notes: "Professional plus subscription.",
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        color: "bg-green-100 text-green-800",
        icon: "fas fa-check-circle",
      },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: "fas fa-clock" },
      overdue: {
        color: "bg-red-100 text-red-800",
        icon: "fas fa-exclamation-triangle",
      },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <i className={`${config.icon} mr-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    return status.toLowerCase() !== "paid" && new Date(dueDate) < new Date();
  };

  // Backend pagination
  const totalPages = Math.ceil(totalInvoices / pagination.limit);
  const startIndex =
    totalInvoices > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endIndex = Math.min(pagination.page * pagination.limit, totalInvoices);

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      onPageChange(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < totalPages) {
      onPageChange(pagination.page + 1);
    }
  };

  const handlePageSizeChange = (event) => {
    const newLimit = parseInt(event.target.value);
    onPageSizeChange(newLimit);
  };

  // Show loading skeleton only when actually loading
  if (isLoading && (!invoices || invoices.length === 0)) {
    return (
      <div className="overflow-hidden">
        {/* Mobile Loading Skeleton */}
        <div className="block lg:hidden">
          <div className="p-4 space-y-4">
            {Array.from({ length: pagination?.limit || 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Loading Skeleton */}
        <div className="hidden lg:block">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Invoice ID",
                  "Tenant",
                  "Plan",
                  "Amount",
                  "Issue Date",
                  "Due Date",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: pagination?.limit || 5 }).map(
                (_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-40"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded w-12"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4">
          <i className="fas fa-file-invoice text-4xl sm:text-6xl text-gray-300 mb-4 sm:mb-6"></i>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No Invoices Found
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            No invoices match your current filters. Try adjusting your search
            criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Mobile Card View */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gray-50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    #{invoice.invoiceId}
                  </span>
                  {isOverdue(invoice.dueDate, invoice.status) && (
                    <i className="fas fa-exclamation-triangle text-red-500 text-sm"></i>
                  )}
                </div>
                {getStatusBadge(invoice.status)}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tenant:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {invoice.tenantName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Due Date:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onViewInvoice(invoice)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    View
                  </Button>
                  <Button
                    onClick={() => onDownloadInvoice(invoice.id)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-download mr-1"></i>
                    Download
                  </Button>
                </div>
                {invoice.status.toLowerCase() !== "paid" && (
                  <Button
                    onClick={() => onMarkPaid(invoice.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2"
                  >
                    <i className="fas fa-check mr-1"></i>
                    Mark Paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issue Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      #{invoice.invoiceId}
                    </span>
                    {isOverdue(invoice.dueDate, invoice.status) && (
                      <i
                        className="fas fa-exclamation-triangle text-red-500 text-sm ml-2"
                        title="Overdue"
                      ></i>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.tenantName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.tenantEmail}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {invoice.planName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.issueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.dueDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(invoice.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => onViewInvoice(invoice)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      View
                    </Button>
                    <Button
                      onClick={() => onDownloadInvoice(invoice.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </Button>
                    {invoice.status.toLowerCase() !== "paid" && (
                      <Button
                        onClick={() => onMarkPaid(invoice.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={handlePrevPage}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={pagination.page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalInvoices}</span> results
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="pageSize" className="text-sm text-gray-700">
                  Show:
                </label>
                <select
                  id="pageSize"
                  value={pagination.limit}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.page} of {totalPages}
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={pagination.page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
