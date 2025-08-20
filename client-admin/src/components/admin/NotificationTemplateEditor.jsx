import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTemplateRequest,
  updateTemplateRequest,
  clearCreateState,
  clearUpdateState,
} from "../../store/admin/notificationTemplatesSlice";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import { useToast } from "../../hooks/use-toast";
import {
  Save,
  Eye,
  RefreshCw,
  Info,
  Shield,
  Activity,
  Bell,
  AlertTriangle,
  X,
} from "lucide-react";

export default function NotificationTemplateEditor({ template, isOpen, onClose, onSave }) {
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // Redux selectors
  const {
    createLoading,
    createError,
    createSuccess,
    updateLoading,
    updateError,
    updateSuccess,
  } = useSelector(state => state.notificationTemplates);

  // Form state
  const [formData, setFormData] = useState({
    templateType: "user_notification",
    name: "",
    subject: "",
    header: "",
    body: "",
    footer: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("basic");

  // Template type configurations
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: 'Compliance Result',
      color: 'bg-blue-100 text-blue-800',
      description: 'Notifications sent when compliance checks are completed'
    },
    audit_log: {
      icon: Activity,
      label: 'Audit Log', 
      color: 'bg-purple-100 text-purple-800',
      description: 'Notifications for audit trail events and security logs'
    },
    user_notification: {
      icon: Bell,
      label: 'User Notification',
      color: 'bg-green-100 text-green-800',
      description: 'General user notifications and account updates'
    },
    system_alert: {
      icon: AlertTriangle,
      label: 'System Alert',
      color: 'bg-red-100 text-red-800',
      description: 'System maintenance and critical alerts'
    }
  };

  // Available variables for templates
  const availableVariables = [
    { name: '{{organizationName}}', description: 'Organization name' },
    { name: '{{userName}}', description: 'User\'s full name' },
    { name: '{{userEmail}}', description: 'User\'s email address' },
    { name: '{{documentName}}', description: 'Document name' },
    { name: '{{complianceStatus}}', description: 'Compliance check result' },
    { name: '{{timestamp}}', description: 'Current timestamp' },
    { name: '{{actionUrl}}', description: 'Action button URL' },
  ];

  // Initialize form data from template prop
  useEffect(() => {
    if (template) {
      setFormData({
        templateType: template.templateType || "user_notification",
        name: template.name || "",
        subject: template.subject || "",
        header: template.header || "",
        body: template.body || "",
        footer: template.footer || "",
        isActive: template.isActive ?? true,
      });
    } else {
      // Reset form for new template
      setFormData({
        templateType: "user_notification",
        name: "",
        subject: "",
        header: "",
        body: "",
        footer: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [template]);

  // Handle Redux success/error states
  useEffect(() => {
    if (createSuccess) {
      toast({
        title: 'Template created',
        description: 'The notification template has been successfully created.',
      });
      onSave?.();
      dispatch(clearCreateState());
    }
  }, [createSuccess, dispatch, onSave]);

  useEffect(() => {
    if (updateSuccess) {
      toast({
        title: 'Template updated',
        description: 'The notification template has been successfully updated.',
      });
      onSave?.();
      dispatch(clearUpdateState());
    }
  }, [updateSuccess, dispatch, onSave]);

  useEffect(() => {
    if (createError) {
      setErrors(createError.errors || {});
      toast({
        title: 'Creation failed',
        description: createError.message || 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    }
  }, [createError]);

  useEffect(() => {
    if (updateError) {
      setErrors(updateError.errors || {});
      toast({
        title: 'Update failed',
        description: updateError.message || 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    }
  }, [updateError]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.body.trim()) newErrors.body = 'Body content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (template) {
      dispatch(updateTemplateRequest({ id: template.id, ...formData }));
    } else {
      dispatch(createTemplateRequest(formData));
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Insert variable into text field
  const insertVariable = (variable, field) => {
    const currentValue = formData[field] || '';
    setFormData(prev => ({
      ...prev,
      [field]: currentValue + variable.name
    }));
  };

  const currentConfig = templateTypeConfig[formData.templateType];
  const IconComponent = currentConfig?.icon || Bell;
  const isLoading = createLoading || updateLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <IconComponent className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {template ? 'Edit Notification Template' : 'Create Notification Template'}
              </h2>
              <p className="text-sm text-gray-500">
                Design email templates for automated notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter template name"
                      className={errors.name ? 'border-red-300' : ''}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type *
                    </label>
                    <select 
                      value={formData.templateType}
                      onChange={(e) => handleInputChange('templateType', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(templateTypeConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`p-4 rounded-lg ${currentConfig.color} bg-opacity-20 border border-current border-opacity-20`}>
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{currentConfig.label}</span>
                    </div>
                    <p className="text-sm">{currentConfig.description}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Template is active</span>
                  </label>
                </div>
              </Card>

              {/* Email Content */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line *
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Enter email subject"
                      className={errors.subject ? 'border-red-300' : ''}
                    />
                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Header
                    </label>
                    <textarea
                      value={formData.header}
                      onChange={(e) => handleInputChange('header', e.target.value)}
                      placeholder="Enter email header (optional greeting)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body Content *
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => handleInputChange('body', e.target.value)}
                      placeholder="Enter main email content"
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.body ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer
                    </label>
                    <textarea
                      value={formData.footer}
                      onChange={(e) => handleInputChange('footer', e.target.value)}
                      placeholder="Enter email footer (optional closing)"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Card>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {template ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {template ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Variables Sidebar */}
          <div className="w-80 bg-gray-50 border-l p-6 overflow-y-auto">
            <div className="sticky top-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Available Variables
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Click on any variable to insert it into your template content.
              </p>
              
              <div className="space-y-2">
                {availableVariables.map((variable, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {variable.name}
                      </code>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => insertVariable(variable, 'subject')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Subject
                        </button>
                        <button
                          type="button"
                          onClick={() => insertVariable(variable, 'body')}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Body
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{variable.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}