import { eq, desc, like, ilike, or, and, count, sql } from 'drizzle-orm';
import { notificationTemplates, notificationTemplateAuditLogs, users } from '../schema.ts';
import { db } from '../../db.ts';

// Helper function to log template changes for audit
const logTemplateChange = async (templateId, action, oldValues, newValues, userId, tenantId, ipAddress, userAgent, changeReason = null) => {
  try {
    await db.insert(notificationTemplateAuditLogs).values({
      tenantId,
      templateId,
      action,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      changedBy: userId,
      changeReason,
      ipAddress,
      userAgent
    });
    console.log(`🔍 Audit: Template ${action} logged for template ${templateId}`);
  } catch (error) {
    console.error('Failed to log template change:', error);
  }
};

// Get all notification templates for tenant with pagination and search
export const getNotificationTemplates = async (req, res) => {
  try {
    console.log('🔍 GET /api/admin/notification-templates - Starting request');
    console.log('🔍 Request user:', req.user);
    
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      templateType = '',
      isActive = ''
    } = req.query;

    console.log(`📧 Request params:`, { page, limit, search, sortBy, sortOrder, templateType, isActive, tenantId });

    // Convert string boolean values to actual boolean
    let isActiveBool = null;
    if (isActive === 'true' || isActive === 'True') {
      isActiveBool = true;
    } else if (isActive === 'false' || isActive === 'False') {
      isActiveBool = false;
    }

    const skip = (page - 1) * limit;

    console.log(`📧 Notification Templates: Fetching templates for tenant ${tenantId}`);

    // Build base query
    let query = db
      .select({
        id: notificationTemplates.id,
        templateType: notificationTemplates.templateType,
        name: notificationTemplates.name,
        subject: notificationTemplates.subject,
        header: notificationTemplates.header,
        body: notificationTemplates.body,
        footer: notificationTemplates.footer,
        variables: notificationTemplates.variables,
        isActive: notificationTemplates.isActive,
        createdAt: notificationTemplates.createdAt,
        updatedAt: notificationTemplates.updatedAt,
        createdByName: users.firstName,
        createdByLastName: users.lastName,
        createdByEmail: users.email
      })
      .from(notificationTemplates)
      .leftJoin(users, eq(notificationTemplates.createdBy, users.id));

    // Apply filters
    let whereConditions = [eq(notificationTemplates.tenantId, tenantId)];

    if (search && search.trim()) {
      const searchTerm = search.trim();
      console.log(`🔍 Applying search filter: "${searchTerm}"`);
      // Use sql function for more reliable search matching
      whereConditions.push(
        sql`(${notificationTemplates.name} ILIKE ${`%${searchTerm}%`} OR ${notificationTemplates.subject} ILIKE ${`%${searchTerm}%`})`
      );
    }

    if (templateType && templateType.trim()) {
      console.log(`🏷️ Applying template type filter: "${templateType}"`);
      whereConditions.push(eq(notificationTemplates.templateType, templateType));
    }

    if (isActiveBool !== null) {
      console.log(`✅ Applying active status filter: ${isActiveBool}`);
      whereConditions.push(eq(notificationTemplates.isActive, isActiveBool));
    }

    console.log(`📋 Total where conditions: ${whereConditions.length}`);
    
    try {
      if (whereConditions.length === 1) {
        query = query.where(whereConditions[0]);
      } else {
        query = query.where(and(...whereConditions));
      }
    } catch (whereError) {
      console.error('Error building where clause:', whereError);
      throw new Error('Invalid filter parameters');
    }

    // Apply sorting
    let sortColumn;
    try {
      // Validate sortBy parameter
      const validSortColumns = ['name', 'templateType', 'subject', 'createdAt', 'updatedAt'];
      const sortField = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
      sortColumn = notificationTemplates[sortField];
      
      console.log(`📊 Sorting by: ${sortField} (${sortOrder})`);
      
      query = sortOrder === 'asc' 
        ? query.orderBy(sortColumn)
        : query.orderBy(desc(sortColumn));
    } catch (sortError) {
      console.error('Error applying sort:', sortError);
      // Fallback to default sorting
      query = query.orderBy(desc(notificationTemplates.createdAt));
    }

    // Get total count
    let totalCountQuery;
    try {
      totalCountQuery = db
        .select({ count: count() })
        .from(notificationTemplates);
      
      if (whereConditions.length === 1) {
        totalCountQuery = totalCountQuery.where(whereConditions[0]);
      } else {
        totalCountQuery = totalCountQuery.where(and(...whereConditions));
      }
    } catch (countError) {
      console.error('Error building count query:', countError);
      throw new Error('Failed to build count query');
    }
    
    console.log(`🔍 Executing queries with pagination: limit=${limit}, offset=${skip}`);
    
    let templatesData, totalCount;
    try {
      [templatesData, totalCount] = await Promise.all([
        query.limit(limit).offset(skip),
        totalCountQuery
      ]);
      
      // Debug: Log template IDs and names when searching
      if (search && search.trim()) {
        console.log('🔍 DEBUG: Raw template data found:', templatesData.length);
        templatesData.forEach((t, i) => {
          console.log(`  ${i+1}. ${t.name} (${t.id})`);
        });
      }
    } catch (queryError) {
      console.error('Database query execution error:', queryError);
      throw new Error('Database query failed');
    }

    const formattedTemplates = templatesData.map(template => {
      // Debug: Log each template's join data
      if (search && search.trim()) {
        console.log(`🔍 DEBUG: Template "${template.name}" - createdBy: ${template.createdByName}, email: ${template.createdByEmail}`);
      }
      
      return {
        ...template,
        createdByName: template.createdByName && template.createdByLastName 
          ? `${template.createdByName} ${template.createdByLastName}`
          : template.createdByEmail || 'Unknown User'
      };
    });

    console.log(`✅ Notification Templates: Found ${formattedTemplates.length} templates (${totalCount[0].count} total)`);
    
    // Debug: Log all template names when searching
    if (search && search.trim()) {
      console.log('🔍 DEBUG: Template names found:', formattedTemplates.map(t => t.name));
    }

    res.json({
      success: true,
      data: formattedTemplates,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get notification templates error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification templates. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get template statistics
export const getTemplateStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const stats = await db
      .select({
        templateType: notificationTemplates.templateType,
        isActive: notificationTemplates.isActive,
        count: count()
      })
      .from(notificationTemplates)
      .where(eq(notificationTemplates.tenantId, tenantId))
      .groupBy(notificationTemplates.templateType, notificationTemplates.isActive);

    const formattedStats = {
      total: 0,
      active: 0,
      inactive: 0,
      byType: {}
    };

    stats.forEach(stat => {
      const count = parseInt(stat.count);
      formattedStats.total += count;
      
      if (stat.isActive) {
        formattedStats.active += count;
      } else {
        formattedStats.inactive += count;
      }

      if (!formattedStats.byType[stat.templateType]) {
        formattedStats.byType[stat.templateType] = 0;
      }
      formattedStats.byType[stat.templateType] += count;
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template statistics. Please try again.'
    });
  }
};

// Create new notification template
export const createNotificationTemplate = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { templateType, name, subject, header, body, footer, variables } = req.body;

    console.log(`👤 Creating notification template: ${name} for tenant ${tenantId}`);

    const templateData = {
      tenantId,
      templateType,
      name,
      subject,
      header,
      body,
      footer,
      variables: variables ? JSON.stringify(variables) : '[]',
      createdBy: userId,
      isActive: true
    };

    const [newTemplate] = await db
      .insert(notificationTemplates)
      .values(templateData)
      .returning();

    // Log the creation in audit logs
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    await logTemplateChange(
      newTemplate.id, 
      'created', 
      null, 
      templateData, 
      userId, 
      tenantId, 
      ipAddress, 
      userAgent,
      `Template created by user`
    );

    console.log(`✅ Notification template created: ${name}`);

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: newTemplate
    });

  } catch (error) {
    console.error('Create notification template error:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'A template with this name and type already exists for your organization.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create notification template. Please try again.'
    });
  }
};

// Update notification template (only Subject, Header, Body, Footer as per requirements)
export const updateNotificationTemplate = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { subject, header, body, footer } = req.body;

    // First, get the current template for audit logging
    const [currentTemplate] = await db
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.id, id),
        eq(notificationTemplates.tenantId, tenantId)
      ));

    if (!currentTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied.'
      });
    }

    console.log(`👤 Updating notification template: ${currentTemplate.name} for tenant ${tenantId}`);

    // Only update the editable fields as per exact requirements
    const updateData = {
      subject,
      header: header || '',
      body,
      footer: footer || '',
      updatedBy: userId,
      updatedAt: new Date()
    };

    const [updatedTemplate] = await db
      .update(notificationTemplates)
      .set(updateData)
      .where(and(
        eq(notificationTemplates.id, id),
        eq(notificationTemplates.tenantId, tenantId)
      ))
      .returning();

    // Log the update in audit logs
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    await logTemplateChange(
      id, 
      'updated', 
      currentTemplate, 
      updateData, 
      userId, 
      tenantId, 
      ipAddress, 
      userAgent,
      `Template updated by user`
    );

    console.log(`✅ Notification template updated: ${updatedTemplate.name}`);

    res.json({
      success: true,
      message: 'Template updated successfully.',
      data: updatedTemplate
    });

  } catch (error) {
    console.error('Update notification template error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Invalid template format. Please check inputs.'
    });
  }
};

// Delete notification template
export const deleteNotificationTemplate = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;

    // First, get the template for audit logging
    const [templateToDelete] = await db
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.id, id),
        eq(notificationTemplates.tenantId, tenantId)
      ));

    if (!templateToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or access denied.'
      });
    }

    console.log(`👤 Deleting notification template: ${templateToDelete.name} for tenant ${tenantId}`);

    await db
      .delete(notificationTemplates)
      .where(and(
        eq(notificationTemplates.id, id),
        eq(notificationTemplates.tenantId, tenantId)
      ));

    // Log the deletion in audit logs
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    await logTemplateChange(
      id, 
      'deleted', 
      templateToDelete, 
      null, 
      userId, 
      tenantId, 
      ipAddress, 
      userAgent,
      `Template deleted by user`
    );

    console.log(`✅ Notification template deleted: ${templateToDelete.name}`);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification template. Please try again.'
    });
  }
};

// Preview notification template with sample data
export const previewNotificationTemplate = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { templateType, subject, header, body, footer, variables } = req.body;

    console.log(`🔍 Previewing notification template of type: ${templateType} for tenant ${tenantId}`);

    // Sample data for different template types
    const sampleData = {
      compliance_result: {
        userName: 'John Doe',
        organizationName: 'Premier Risk Management',
        documentName: 'Insurance_Policy_2025.pdf',
        complianceStatus: 'Compliant',
        rulesChecked: 5,
        rulesPassed: 5,
        rulesFailed: 0,
        timestamp: new Date().toLocaleString(),
        detailsUrl: 'https://app.insurcheck.com/compliance-reports/12345'
      },
      audit_log: {
        userName: 'Jane Smith',
        organizationName: 'Premier Risk Management',
        action: 'Updated compliance rule',
        resource: 'Compliance Rule RULE-001',
        timestamp: new Date().toLocaleString(),
        ipAddress: '192.168.1.100',
        details: 'Modified field validation for document filename requirements',
        logUrl: 'https://app.insurcheck.com/audit-logs/67890'
      },
      user_notification: {
        userName: 'Mike Johnson',
        organizationName: 'Premier Risk Management',
        notificationType: 'Account Update',
        message: 'Your account settings have been successfully updated',
        timestamp: new Date().toLocaleString(),
        actionRequired: false,
        actionUrl: 'https://app.insurcheck.com/settings'
      },
      system_alert: {
        organizationName: 'Premier Risk Management',
        alertType: 'System Maintenance',
        severity: 'Medium',
        message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST',
        timestamp: new Date().toLocaleString(),
        affectedServices: 'Document processing, API endpoints',
        statusUrl: 'https://status.insurcheck.com'
      }
    };

    const data = sampleData[templateType] || sampleData.user_notification;

    // Replace template variables with sample data
    const replaceVariables = (text, data) => {
      if (!text) return text;
      
      let result = text;
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        result = result.replace(regex, data[key] || '');
      });
      
      return result;
    };

    const preview = {
      subject: replaceVariables(subject, data),
      header: replaceVariables(header, data),
      body: replaceVariables(body, data),
      footer: replaceVariables(footer, data),
      templateType,
      sampleData: data,
      availableVariables: Object.keys(data).map(key => `{{${key}}}`)
    };

    res.json({
      success: true,
      data: {
        preview,
        metadata: {
          templateType,
          previewGeneratedAt: new Date().toISOString(),
          variablesCount: Object.keys(data).length
        }
      }
    });

  } catch (error) {
    console.error('Preview notification template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview template. Please try again.'
    });
  }
};

// Get audit logs for notification templates
export const getTemplateAuditLogs = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      templateId = ''
    } = req.query;

    const skip = (page - 1) * limit;

    console.log(`📋 Template Audit Logs: Fetching logs for tenant ${tenantId}`);

    let query = db
      .select({
        id: notificationTemplateAuditLogs.id,
        templateId: notificationTemplateAuditLogs.templateId,
        action: notificationTemplateAuditLogs.action,
        oldValues: notificationTemplateAuditLogs.oldValues,
        newValues: notificationTemplateAuditLogs.newValues,
        changeReason: notificationTemplateAuditLogs.changeReason,
        ipAddress: notificationTemplateAuditLogs.ipAddress,
        userAgent: notificationTemplateAuditLogs.userAgent,
        createdAt: notificationTemplateAuditLogs.createdAt,
        changedByName: users.firstName,
        changedByLastName: users.lastName,
        changedByEmail: users.email,
        templateName: notificationTemplates.name,
        templateType: notificationTemplates.templateType
      })
      .from(notificationTemplateAuditLogs)
      .leftJoin(users, eq(notificationTemplateAuditLogs.changedBy, users.id))
      .leftJoin(notificationTemplates, eq(notificationTemplateAuditLogs.templateId, notificationTemplates.id))
      .where(eq(notificationTemplateAuditLogs.tenantId, tenantId));

    if (templateId) {
      query = query.where(and(
        eq(notificationTemplateAuditLogs.tenantId, tenantId),
        eq(notificationTemplateAuditLogs.templateId, templateId)
      ));
    }

    query = query.orderBy(desc(notificationTemplateAuditLogs.createdAt));

    const [logsData, totalCount] = await Promise.all([
      query.limit(limit).offset(skip),
      db.select({ count: count() }).from(notificationTemplateAuditLogs).where(
        templateId 
          ? and(eq(notificationTemplateAuditLogs.tenantId, tenantId), eq(notificationTemplateAuditLogs.templateId, templateId))
          : eq(notificationTemplateAuditLogs.tenantId, tenantId)
      )
    ]);

    const formattedLogs = logsData.map(log => {
      let oldValues = null;
      let newValues = null;
      
      // Safe JSON parsing for oldValues
      if (log.oldValues) {
        try {
          oldValues = typeof log.oldValues === 'string' ? JSON.parse(log.oldValues) : log.oldValues;
        } catch (e) {
          console.error('Error parsing oldValues:', e, log.oldValues);
          oldValues = null;
        }
      }
      
      // Safe JSON parsing for newValues
      if (log.newValues) {
        try {
          newValues = typeof log.newValues === 'string' ? JSON.parse(log.newValues) : log.newValues;
        } catch (e) {
          console.error('Error parsing newValues:', e, log.newValues);
          newValues = null;
        }
      }
      
      return {
        ...log,
        changedByName: log.changedByName && log.changedByLastName 
          ? `${log.changedByName} ${log.changedByLastName}`
          : log.changedByEmail || 'System',
        oldValues,
        newValues
      };
    });

    console.log(`✅ Template Audit Logs: Found ${formattedLogs.length} logs (${totalCount[0].count} total)`);

    res.json({
      success: true,
      data: formattedLogs,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Get template audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs. Please try again.'
    });
  }
};