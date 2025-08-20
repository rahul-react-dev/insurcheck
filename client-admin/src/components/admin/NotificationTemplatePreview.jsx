import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminAPI } from '../../utils/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { 
  Mail, 
  RefreshCw, 
  Sparkles,
  Shield,
  Activity,
  Bell,
  AlertTriangle,
  Clock,
  User,
  Building2,
  FileText
} from 'lucide-react';

export function NotificationTemplatePreview({ template, onClose }) {
  const { toast } = useToast();
  const [preview, setPreview] = useState(null);

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
  const previewMutation = useMutation({
    mutationFn: (templateData) => adminAPI.previewNotificationTemplate(templateData),
    onSuccess: (data) => {
      setPreview(data.data);
    },
    onError: (error) => {
      toast({
        title: 'Preview failed',
        description: error.message || 'Failed to generate preview. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Generate preview on mount
  useEffect(() => {
    if (template) {
      const templateData = {
        templateType: template.templateType,
        subject: template.subject,
        header: template.header || '',
        body: template.body,
        footer: template.footer || '',
        variables: template.variables ? JSON.parse(template.variables) : []
      };
      previewMutation.mutate(templateData);
    }
  }, [template]);

  const refreshPreview = () => {
    if (template) {
      const templateData = {
        templateType: template.templateType,
        subject: template.subject,
        header: template.header || '',
        body: template.body,
        footer: template.footer || '',
        variables: template.variables ? JSON.parse(template.variables) : []
      };
      previewMutation.mutate(templateData);
    }
  };

  if (!template) {
    return null;
  }

  const typeConfig = templateTypeConfig[template.templateType] || templateTypeConfig.user_notification;
  const IconComponent = typeConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {template.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={typeConfig.color}>
              <IconComponent className="h-3 w-3 mr-1" />
              {typeConfig.label}
            </Badge>
            <Badge variant={template.isActive ? 'default' : 'secondary'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshPreview}
          disabled={previewMutation.isLoading}
        >
          {previewMutation.isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Preview
        </Button>
      </div>

      {/* Preview Content */}
      {previewMutation.isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : preview ? (
        <div className="space-y-6">
          {/* Email Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Email Preview
              </CardTitle>
              <CardDescription>
                This is how the email will appear to recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-white shadow-sm">
                {/* Email Header */}
                <div className="border-b bg-gray-50 px-6 py-4 rounded-t-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>From: InsurCheck &lt;noreply@insurcheck.com&gt;</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>To: recipient@example.com</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {preview.preview.subject}
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="px-6 py-6 space-y-6">
                  {preview.preview.header && (
                    <div className="text-gray-900 whitespace-pre-line">
                      {preview.preview.header}
                    </div>
                  )}

                  <div className="text-gray-900 whitespace-pre-line leading-relaxed">
                    {preview.preview.body}
                  </div>

                  {preview.preview.footer && (
                    <div className="border-t pt-4 mt-6 text-gray-600 text-sm whitespace-pre-line">
                      {preview.preview.footer}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample Data Used
              </CardTitle>
              <CardDescription>
                These sample values were used to generate the preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(preview.preview.sampleData).map(([key, value]) => (
                  <div key={key} className="flex flex-col space-y-1">
                    <div className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm bg-gray-50 rounded px-2 py-1 font-mono">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Variables */}
          <Card>
            <CardHeader>
              <CardTitle>Available Variables</CardTitle>
              <CardDescription>
                Variables that can be used in this template type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {preview.preview.availableVariables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="font-mono text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Template Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Template Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Template Type</div>
                  <Badge variant="secondary" className={typeConfig.color}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Status</div>
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Created</div>
                  <div className="text-sm text-gray-900">
                    {new Date(template.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Last Updated</div>
                  <div className="text-sm text-gray-900">
                    {template.updatedAt ? 
                      new Date(template.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Never'
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Variables Count</div>
                  <div className="text-sm text-gray-900">
                    {preview.metadata.variablesCount} available
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-600">Preview Generated</div>
                  <div className="text-sm text-gray-900">
                    {new Date(preview.metadata.previewGeneratedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Unable to generate preview. Please try again.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={onClose}>
          Close Preview
        </Button>
      </div>
    </div>
  );
}