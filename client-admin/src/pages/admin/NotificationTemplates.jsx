import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTemplatesRequest,
  updateTemplateRequest,
  previewTemplateRequest,
  clearUpdateState,
  clearPreviewState,
} from '../../store/admin/notificationTemplatesSlice';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/use-toast';
import { 
  Mail,
  Shield,
  AlertTriangle,
  Eye,
  Save,
  RefreshCw
} from 'lucide-react';

const NotificationTemplates = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // Redux selectors
  const {
    templates,
    templatesLoading,
    templatesError,
    updateLoading,
    updateSuccess,
    updateError,
    previewData,
    previewLoading,
    previewError,
  } = useSelector(state => state.notificationTemplates);

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sample data for preview
  const sampleData = {
    organizationName: 'InsurCheck Corporation',
    userName: 'John Smith',
    documentName: 'Policy Document XYZ-123',
    complianceScore: '95%',
    issues: '2 minor issues found',
    reviewDate: new Date().toLocaleDateString(),
  };

  // Template type configurations (only compliance and audit as required)
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: 'Compliance Result',
      description: 'Notifications sent after document compliance checks',
      color: 'bg-blue-100 text-blue-800',
    },
    audit_log: {
      icon: AlertTriangle,
      label: 'Audit Log',
      description: 'Notifications for audit events and changes',
      color: 'bg-orange-100 text-orange-800',
    },
  };

  // Fetch templates on component mount
  useEffect(() => {
    dispatch(fetchTemplatesRequest({
      templateType: 'compliance_result,audit_log', // Only these two types
      limit: 10
    }));
  }, [dispatch]);

  // Handle success/error states
  useEffect(() => {
    if (updateSuccess) {
      toast({
        title: 'Template updated successfully.',
        description: 'Changes have been applied to all future notifications.',
        variant: 'default',
      });
      setHasChanges(false);
      dispatch(clearUpdateState());
      // Refresh templates list
      dispatch(fetchTemplatesRequest({
        templateType: 'compliance_result,audit_log',
        limit: 10
      }));
    }
  }, [updateSuccess, dispatch, toast]);

  useEffect(() => {
    if (updateError) {
      toast({
        title: 'Invalid template format. Please check inputs.',
        description: updateError,
        variant: 'destructive',
      });
      dispatch(clearUpdateState());
    }
  }, [updateError, dispatch, toast]);

  useEffect(() => {
    if (previewError) {
      toast({
        title: 'Failed to preview template. Please try again.',
        description: previewError,
        variant: 'destructive',
      });
    }
  }, [previewError, toast]);

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate({ ...template });
    setIsPreviewMode(false);
    setHasChanges(false);
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setEditedTemplate(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Handle save template
  const handleSaveTemplate = () => {
    if (!editedTemplate || !hasChanges) return;

    dispatch(updateTemplateRequest({
      id: editedTemplate.id,
      templateData: {
        subject: editedTemplate.subject,
        header: editedTemplate.header,
        body: editedTemplate.body,
        footer: editedTemplate.footer,
      }
    }));
  };

  // Handle preview template
  const handlePreviewTemplate = () => {
    if (!editedTemplate) return;

    dispatch(previewTemplateRequest({
      ...editedTemplate,
      variables: sampleData
    }));
    setIsPreviewMode(true);
  };

  // Filter templates to only show compliance and audit types
  const filteredTemplates = templates.filter(t => 
    t.templateType === 'compliance_result' || t.templateType === 'audit_log'
  );

  if (templatesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading notification templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configure Notification Templates</h1>
        <p className="text-gray-600">
          Customize email notifications for compliance results and audit logs to align with organizational branding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Templates
            </h2>
            
            <div className="space-y-3">
              {filteredTemplates.map((template) => {
                const config = templateTypeConfig[template.templateType];
                const IconComponent = config?.icon || Mail;
                
                return (
                  <div
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {config?.label || template.templateType}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {config?.description}
                        </p>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${config?.color}`}>
                          {template.templateType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No templates found</p>
              </div>
            )}
          </Card>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Edit Template</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewTemplate}
                    disabled={previewLoading}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {previewLoading ? 'Generating...' : 'Preview'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={!hasChanges || updateLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              {isPreviewMode && previewData ? (
                // Preview Mode
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 text-gray-700">Email Preview</h3>
                    <div className="bg-white border rounded-lg p-4">
                      <div className="border-b pb-3 mb-4">
                        <h4 className="font-medium text-gray-900">{previewData.subject}</h4>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="font-medium">{previewData.header}</div>
                        <div className="whitespace-pre-wrap">{previewData.body}</div>
                        <div className="pt-4 border-t text-gray-600">{previewData.footer}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPreviewMode(false)}
                    className="w-full"
                  >
                    Back to Editor
                  </Button>
                </div>
              ) : (
                // Edit Mode  
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line
                    </label>
                    <Input
                      value={editedTemplate?.subject || ''}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Header
                    </label>
                    <textarea
                      value={editedTemplate?.header || ''}
                      onChange={(e) => handleFieldChange('header', e.target.value)}
                      placeholder="Enter email header..."
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body
                    </label>
                    <textarea
                      value={editedTemplate?.body || ''}
                      onChange={(e) => handleFieldChange('body', e.target.value)}
                      placeholder="Enter email body..."
                      className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Footer
                    </label>
                    <textarea
                      value={editedTemplate?.footer || ''}
                      onChange={(e) => handleFieldChange('footer', e.target.value)}
                      placeholder="Enter email footer..."
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Available Variables:</strong> {{organizationName}}, {{userName}}, {{documentName}}, {{complianceScore}}, {{issues}}, {{reviewDate}}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8">
              <div className="text-center text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a Template</h3>
                <p className="text-sm">
                  Choose a notification template from the left to start editing.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationTemplates;