import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminAuthApi } from "../../utils/api";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useToast } from "../../hooks/use-toast";
import {
  Eye,
  RefreshCw,
  Mail,
  X,
  Settings,
  Send,
  Shield,
  Activity,
  Bell,
  AlertTriangle,
} from "lucide-react";

export default function NotificationTemplatePreview({ template, isOpen, onClose }) {
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState(null);
  const [sampleVariables, setSampleVariables] = useState({
    organizationName: 'InsurCheck Corporation',
    userName: 'John Smith',
    userEmail: 'john.smith@example.com',
    documentName: 'Insurance Policy Document.pdf',
    complianceStatus: 'Approved',
    timestamp: new Date().toLocaleDateString(),
    actionUrl: 'https://app.insurcheck.com/documents/123',
  });

  // Template type configurations
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: 'Compliance Result',
      color: 'bg-blue-100 text-blue-800',
    },
    audit_log: {
      icon: Activity,
      label: 'Audit Log',
      color: 'bg-purple-100 text-purple-800',
    },
    user_notification: {
      icon: Bell,
      label: 'User Notification',
      color: 'bg-green-100 text-green-800',
    },
    system_alert: {
      icon: AlertTriangle,
      label: 'System Alert',
      color: 'bg-red-100 text-red-800',
    }
  };

  // Preview template mutation
  const previewTemplateMutation = useMutation({
    mutationFn: (templateData) => adminAuthApi.previewNotificationTemplate({
      ...templateData,
      variables: sampleVariables
    }),
    onSuccess: (response) => {
      setPreviewData(response.data);
    },
    onError: (error) => {
      const errorData = JSON.parse(error.message || '{}');
      toast({
        title: 'Preview failed',
        description: errorData.message || 'Failed to generate preview. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Generate preview when template changes
  useEffect(() => {
    if (template && isOpen) {
      previewTemplateMutation.mutate(template);
    }
  }, [template, isOpen, sampleVariables]);

  // Handle variable changes
  const handleVariableChange = (key, value) => {
    setSampleVariables(prev => ({ ...prev, [key]: value }));
  };

  // Refresh preview
  const refreshPreview = () => {
    if (template) {
      previewTemplateMutation.mutate(template);
    }
  };

  if (!isOpen || !template) return null;

  const currentConfig = templateTypeConfig[template.templateType] || templateTypeConfig.user_notification;
  const IconComponent = currentConfig.icon;
  const isLoading = previewTemplateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <IconComponent className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Template Preview</h2>
              <p className="text-sm text-gray-500">
                {template.name} • {currentConfig.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={refreshPreview}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Variables Sidebar */}
          <div className="w-80 bg-gray-50 border-r p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Sample Variables
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Modify these sample values to see how they appear in the template.
            </p>
            
            <div className="space-y-4">
              {Object.entries(sampleVariables).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Generating preview...</p>
                </div>
              </div>
            ) : previewData ? (
              <div className="space-y-6">
                {/* Email Preview */}
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                  </div>

                  {/* Email Container */}
                  <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                    {/* Email Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">To:</span>
                          <span className="text-sm text-gray-900">{sampleVariables.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Subject:</span>
                          <span className="text-sm text-gray-900 font-medium">
                            {previewData.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="px-6 py-6">
                      <div className="max-w-none prose prose-sm">
                        {previewData.header && (
                          <div className="mb-4 text-gray-800">
                            {previewData.header.split('\n').map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">{line || '\u00A0'}</p>
                            ))}
                          </div>
                        )}
                        
                        <div className="mb-4 text-gray-800">
                          {previewData.body.split('\n').map((line, index) => (
                            <p key={index} className="mb-2 last:mb-0">{line || '\u00A0'}</p>
                          ))}
                        </div>

                        {previewData.footer && (
                          <div className="mt-6 pt-4 border-t border-gray-200 text-gray-600">
                            {previewData.footer.split('\n').map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">{line || '\u00A0'}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Template Details */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Details</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Template Name:</span>
                      <p className="text-sm text-gray-900 mt-1">{template.name}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentConfig.color}`}>
                          <IconComponent className="h-3 w-3 mr-1" />
                          {currentConfig.label}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600">Created:</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Mail className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No preview data available</p>
                  <Button onClick={refreshPreview} className="mt-4" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}