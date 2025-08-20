import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../utils/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/textarea";
import Badge from "../ui/badge";
import Switch from "../ui/switch";
import Label from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "../../hooks/use-toast";
import {
  Save,
  Eye,
  RefreshCw,
  Info,
  Wand2,
  Shield,
  Activity,
  Bell,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export function NotificationTemplateEditor({ template, onClose, onSave }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    templateType: "user_notification",
    name: "",
    subject: "",
    header: "",
    body: "",
    footer: "",
    variables: [],
    isActive: true,
  });

  const [preview, setPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Template type configurations
  const templateTypeConfig = {
    compliance_result: {
      icon: Shield,
      label: "Compliance Result",
      color: "bg-blue-100 text-blue-800",
      description: "Notifications sent when compliance checks are completed",
      variables: [
        "{{userName}}",
        "{{organizationName}}",
        "{{documentName}}",
        "{{complianceStatus}}",
        "{{rulesChecked}}",
        "{{rulesPassed}}",
        "{{rulesFailed}}",
        "{{timestamp}}",
        "{{detailsUrl}}",
      ],
    },
    audit_log: {
      icon: Activity,
      label: "Audit Log",
      color: "bg-purple-100 text-purple-800",
      description: "Notifications for audit trail events and security logs",
      variables: [
        "{{userName}}",
        "{{organizationName}}",
        "{{action}}",
        "{{resource}}",
        "{{timestamp}}",
        "{{ipAddress}}",
        "{{details}}",
        "{{logUrl}}",
      ],
    },
    user_notification: {
      icon: Bell,
      label: "User Notification",
      color: "bg-green-100 text-green-800",
      description: "General user notifications and account updates",
      variables: [
        "{{userName}}",
        "{{organizationName}}",
        "{{notificationType}}",
        "{{message}}",
        "{{timestamp}}",
        "{{actionRequired}}",
        "{{actionUrl}}",
      ],
    },
    system_alert: {
      icon: AlertTriangle,
      label: "System Alert",
      color: "bg-red-100 text-red-800",
      description: "System maintenance and critical alerts",
      variables: [
        "{{organizationName}}",
        "{{alertType}}",
        "{{severity}}",
        "{{message}}",
        "{{timestamp}}",
        "{{affectedServices}}",
        "{{statusUrl}}",
      ],
    },
  };

  // Initialize form with template data
  useEffect(() => {
    if (template) {
      setFormData({
        templateType: template.templateType,
        name: template.name,
        subject: template.subject,
        header: template.header || "",
        body: template.body,
        footer: template.footer || "",
        variables: template.variables ? JSON.parse(template.variables) : [],
        isActive: template.isActive,
      });
    }
  }, [template]);

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) => {
      if (template) {
        return adminAPI.updateNotificationTemplate(template.id, templateData);
      } else {
        return adminAPI.createNotificationTemplate(templateData);
      }
    },
    onSuccess: () => {
      toast({
        title: template ? "Template updated" : "Template created",
        description: `The notification template has been successfully ${template ? "updated" : "created"}.`,
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description:
          error.message || "Failed to save template. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Preview template mutation
  const previewTemplateMutation = useMutation({
    mutationFn: (templateData) =>
      adminAPI.previewNotificationTemplate(templateData),
    onSuccess: (data) => {
      setPreview(data.data.preview);
      setActiveTab("preview");
    },
    onError: (error) => {
      toast({
        title: "Preview failed",
        description:
          error.message || "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save
  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Validation error",
        description: "Subject is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.body.trim()) {
      toast({
        title: "Validation error",
        description: "Body is required.",
        variant: "destructive",
      });
      return;
    }

    saveTemplateMutation.mutate(formData);
  };

  // Handle preview
  const handlePreview = () => {
    if (!formData.subject.trim() || !formData.body.trim()) {
      toast({
        title: "Validation error",
        description: "Subject and body are required for preview.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPreview(true);
    previewTemplateMutation.mutate(formData);
    setTimeout(() => setIsLoadingPreview(false), 1000); // Visual feedback
  };

  // Insert variable at cursor
  const insertVariable = (variable, field) => {
    const textarea = document.getElementById(field);
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = formData[field];
      const newValue =
        currentValue.substring(0, start) +
        variable +
        currentValue.substring(end);

      handleInputChange(field, newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length,
          start + variable.length,
        );
      }, 0);
    } else {
      // Fallback - append to end
      handleInputChange(field, formData[field] + variable);
    }
  };

  // Apply template suggestions
  const applyTemplate = (type) => {
    const templates = {
      compliance_result: {
        subject:
          "[{{organizationName}}] Compliance Check Results for {{documentName}}",
        header: "Dear {{userName}},",
        body: `We have completed the compliance check for your document "{{documentName}}".

**Status**: {{complianceStatus}}
**Rules Checked**: {{rulesChecked}}
**Rules Passed**: {{rulesPassed}}
**Rules Failed**: {{rulesFailed}}

The compliance check was completed on {{timestamp}}.

${formData.templateType === "compliance_result" ? "You can view detailed results by clicking the link below." : ""}`,
        footer: `Best regards,
The {{organizationName}} Compliance Team

View Details: {{detailsUrl}}`,
      },
      audit_log: {
        subject: "[{{organizationName}}] Security Alert: {{action}}",
        header: "Security Team Alert",
        body: `A security-relevant action has occurred in your organization:

**User**: {{userName}}
**Action**: {{action}}
**Resource**: {{resource}}
**Time**: {{timestamp}}
**IP Address**: {{ipAddress}}

**Details**: {{details}}

This notification was generated automatically as part of our security monitoring.`,
        footer: `Security Team
{{organizationName}}

View Audit Log: {{logUrl}}`,
      },
      user_notification: {
        subject: "[{{organizationName}}] {{notificationType}}",
        header: "Hello {{userName}},",
        body: `{{message}}

This notification was sent on {{timestamp}}.

{{#if actionRequired}}Please take action by visiting the link below.{{/if}}`,
        footer: `Thank you,
{{organizationName}} Team

{{#if actionUrl}}Take Action: {{actionUrl}}{{/if}}`,
      },
      system_alert: {
        subject: "[{{organizationName}}] System Alert: {{alertType}}",
        header: "System Alert Notification",
        body: `**Alert Type**: {{alertType}}
**Severity**: {{severity}}

{{message}}

**Time**: {{timestamp}}
**Affected Services**: {{affectedServices}}

We are working to resolve this issue as quickly as possible.`,
        footer: `System Operations Team
{{organizationName}}

Status Updates: {{statusUrl}}`,
      },
    };

    const template = templates[type] || templates.user_notification;
    setFormData((prev) => ({
      ...prev,
      subject: template.subject,
      header: template.header,
      body: template.body,
      footer: template.footer,
    }));

    toast({
      title: "Template applied",
      description:
        "The template has been applied. You can now customize it further.",
    });
  };

  const currentTypeConfig =
    templateTypeConfig[formData.templateType] ||
    templateTypeConfig.user_notification;
  const IconComponent = currentTypeConfig.icon;

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="Enter template name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="templateType">Template Type</Label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) =>
                    handleInputChange("templateType", value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templateTypeConfig).map(([key, config]) => {
                      const IconComp = config.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center">
                            <IconComp className="h-4 w-4 mr-2" />
                            {config.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Active Template</Label>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  {currentTypeConfig.label}
                </CardTitle>
                <CardDescription>
                  {currentTypeConfig.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">
                      Available Variables
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentTypeConfig.variables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="secondary"
                          className="text-xs"
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(formData.templateType)}
                    className="w-full"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Apply Template Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="header">Header (Optional)</Label>
                <Textarea
                  id="header"
                  placeholder="Enter email header/greeting"
                  value={formData.header}
                  onChange={(e) => handleInputChange("header", e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="body">Body Content</Label>
                <Textarea
                  id="body"
                  placeholder="Enter email body content"
                  value={formData.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  rows={8}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="footer">Footer (Optional)</Label>
                <Textarea
                  id="footer"
                  placeholder="Enter email footer/signature"
                  value={formData.footer}
                  onChange={(e) => handleInputChange("footer", e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Variables</CardTitle>
                <CardDescription>
                  Click to insert variables into your template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["subject", "header", "body", "footer"].map((field) => (
                    <div key={field}>
                      <Label className="text-sm font-medium capitalize">
                        {field}
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {currentTypeConfig.variables.map((variable) => (
                          <Button
                            key={`${field}-${variable}`}
                            variant="ghost"
                            size="sm"
                            onClick={() => insertVariable(variable, field)}
                            className="h-auto p-1 text-xs"
                          >
                            {variable}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Tip:</strong> Place your cursor in the text area
                      and click a variable to insert it at that position.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Template Preview</h3>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewTemplateMutation.isLoading || isLoadingPreview}
            >
              {previewTemplateMutation.isLoading || isLoadingPreview ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Generate Preview
            </Button>
          </div>

          {preview ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Preview with Sample Data
                </CardTitle>
                <CardDescription>
                  This is how your template will look with real data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h4 className="font-medium text-sm text-gray-600">
                        Subject
                      </h4>
                      <p className="mt-1 font-semibold">{preview.subject}</p>
                    </div>

                    {preview.header && (
                      <div className="border-b pb-3">
                        <h4 className="font-medium text-sm text-gray-600">
                          Header
                        </h4>
                        <div className="mt-1 whitespace-pre-line">
                          {preview.header}
                        </div>
                      </div>
                    )}

                    <div className="border-b pb-3">
                      <h4 className="font-medium text-sm text-gray-600">
                        Body
                      </h4>
                      <div className="mt-1 whitespace-pre-line">
                        {preview.body}
                      </div>
                    </div>

                    {preview.footer && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-600">
                          Footer
                        </h4>
                        <div className="mt-1 whitespace-pre-line text-gray-600">
                          {preview.footer}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sample Data Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {preview.availableVariables.map((variable) => (
                        <div key={variable} className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Generate Preview" to see how your template will look</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={previewTemplateMutation.isLoading || isLoadingPreview}
          >
            {previewTemplateMutation.isLoading || isLoadingPreview ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Preview
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveTemplateMutation.isLoading}
          >
            {saveTemplateMutation.isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {template ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
