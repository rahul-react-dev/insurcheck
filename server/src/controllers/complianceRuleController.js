import { eq, desc, like, or, and, count } from 'drizzle-orm';
import { complianceRules, complianceRuleAuditLogs, users, documents } from '../../../shared/schema.ts';
import { db } from '../../db.js';

// Helper function to generate unique rule ID
const generateRuleId = async (tenantId, prefix = 'RULE') => {
  const existingRules = await db
    .select({ ruleId: complianceRules.ruleId })
    .from(complianceRules)
    .where(eq(complianceRules.tenantId, tenantId))
    .orderBy(desc(complianceRules.createdAt));

  const ruleNumbers = existingRules
    .map(rule => rule.ruleId.match(new RegExp(`^${prefix}-(\\d+)$`)))
    .filter(match => match)
    .map(match => parseInt(match[1]));

  const nextNumber = ruleNumbers.length > 0 ? Math.max(...ruleNumbers) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};

// Helper function to log rule changes for audit
const logRuleChange = async (ruleId, action, oldValues, newValues, userId, tenantId, ipAddress, userAgent, changeReason = null) => {
  try {
    await db.insert(complianceRuleAuditLogs).values({
      tenantId,
      ruleId,
      action,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      changedBy: userId,
      changeReason,
      ipAddress,
      userAgent
    });
    console.log(`🔍 Audit: Rule ${action} logged for rule ${ruleId}`);
  } catch (error) {
    console.error('Failed to log rule change:', error);
  }
};

// Get all compliance rules for tenant with pagination and search
export const getComplianceRules = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      ruleType = '',
      isActive = ''
    } = req.query;

    const skip = (page - 1) * limit;

    console.log(`📋 Compliance Rules: Fetching rules for tenant ${tenantId}`);

    // Build base query
    let query = db
      .select({
        id: complianceRules.id,
        ruleId: complianceRules.ruleId,
        fieldName: complianceRules.fieldName,
        ruleType: complianceRules.ruleType,
        value: complianceRules.value,
        description: complianceRules.description,
        isActive: complianceRules.isActive,
        createdAt: complianceRules.createdAt,
        updatedAt: complianceRules.updatedAt,
        createdByName: users.firstName,
        createdByLastName: users.lastName,
        createdByEmail: users.email
      })
      .from(complianceRules)
      .leftJoin(users, eq(complianceRules.createdBy, users.id));

    // Apply filters
    let whereConditions = [eq(complianceRules.tenantId, tenantId)];

    if (search) {
      whereConditions.push(
        or(
          like(complianceRules.ruleId, `%${search}%`),
          like(complianceRules.fieldName, `%${search}%`),
          like(complianceRules.description, `%${search}%`)
        )
      );
    }

    if (ruleType) {
      whereConditions.push(eq(complianceRules.ruleType, ruleType));
    }

    if (isActive !== '') {
      whereConditions.push(eq(complianceRules.isActive, isActive === 'true'));
    }

    query = query.where(and(...whereConditions));

    // Apply sorting
    const sortColumn = complianceRules[sortBy] || complianceRules.createdAt;
    query = sortOrder === 'asc' 
      ? query.orderBy(sortColumn)
      : query.orderBy(desc(sortColumn));

    // Get total count
    const totalCountQuery = db
      .select({ count: count() })
      .from(complianceRules)
      .where(and(...whereConditions));
    
    const [rulesData, totalCount] = await Promise.all([
      query.limit(limit).offset(skip),
      totalCountQuery
    ]);

    const formattedRules = rulesData.map(rule => ({
      ...rule,
      createdByName: rule.createdByName && rule.createdByLastName 
        ? `${rule.createdByName} ${rule.createdByLastName}`
        : rule.createdByEmail || 'Unknown User'
    }));

    console.log(`✅ Compliance Rules: Found ${formattedRules.length} rules (${totalCount[0].count} total)`);

    res.json({
      success: true,
      data: formattedRules,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Get compliance rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance rules. Please try again.'
    });
  }
};

// Get rule statistics
export const getRuleStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const [totalRules, activeRules, ruleTypes] = await Promise.all([
      db.select({ count: count() }).from(complianceRules).where(eq(complianceRules.tenantId, tenantId)),
      db.select({ count: count() }).from(complianceRules).where(and(eq(complianceRules.tenantId, tenantId), eq(complianceRules.isActive, true))),
      db.select({ 
        ruleType: complianceRules.ruleType, 
        count: count() 
      }).from(complianceRules)
        .where(and(eq(complianceRules.tenantId, tenantId), eq(complianceRules.isActive, true)))
        .groupBy(complianceRules.ruleType)
    ]);

    res.json({
      success: true,
      data: {
        total: totalRules[0].count,
        active: activeRules[0].count,
        inactive: totalRules[0].count - activeRules[0].count,
        byType: ruleTypes.reduce((acc, item) => {
          acc[item.ruleType] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get rule stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rule statistics'
    });
  }
};

// Create new compliance rule
export const createComplianceRule = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { fieldName, ruleType, value, description } = req.body;

    // Generate unique rule ID
    const ruleId = await generateRuleId(tenantId, 'RULE');

    console.log(`👤 Creating compliance rule: ${ruleId} for tenant ${tenantId}`);

    // Validate rule value based on type
    let processedValue = value;
    if (ruleType === 'format' && value) {
      try {
        new RegExp(value); // Validate regex pattern
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid regex pattern in value field'
        });
      }
    }

    if (ruleType === 'range' && value) {
      const rangePattern = /^(\d+)-(\d+)$/;
      if (!rangePattern.test(value)) {
        return res.status(400).json({
          success: false,
          message: 'Range value must be in format "min-max" (e.g., "1-100")'
        });
      }
    }

    // Create the rule
    const newRule = await db.insert(complianceRules).values({
      tenantId,
      ruleId,
      fieldName,
      ruleType,
      value: processedValue,
      description,
      createdBy: userId,
      isActive: true
    }).returning();

    // Log the creation
    await logRuleChange(
      newRule[0].id,
      'created',
      null,
      { ruleId, fieldName, ruleType, value: processedValue, description },
      userId,
      tenantId,
      req.ip,
      req.get('User-Agent'),
      'Rule created via admin interface'
    );

    console.log(`✅ Compliance rule created: ${ruleId}`);

    res.status(201).json({
      success: true,
      message: 'Rule created successfully',
      data: newRule[0]
    });

  } catch (error) {
    console.error('Create compliance rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create compliance rule. Please try again.'
    });
  }
};

// Update compliance rule
export const updateComplianceRule = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;
    const { fieldName, ruleType, value, description, isActive } = req.body;

    // Get existing rule
    const existingRule = await db
      .select()
      .from(complianceRules)
      .where(and(eq(complianceRules.id, id), eq(complianceRules.tenantId, tenantId)))
      .limit(1);

    if (!existingRule.length) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    const oldRule = existingRule[0];

    // Validate rule value based on type
    let processedValue = value;
    if (ruleType === 'format' && value) {
      try {
        new RegExp(value);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid regex pattern in value field'
        });
      }
    }

    if (ruleType === 'range' && value) {
      const rangePattern = /^(\d+)-(\d+)$/;
      if (!rangePattern.test(value)) {
        return res.status(400).json({
          success: false,
          message: 'Range value must be in format "min-max" (e.g., "1-100")'
        });
      }
    }

    const updatedRule = await db
      .update(complianceRules)
      .set({
        fieldName,
        ruleType,
        value: processedValue,
        description,
        isActive,
        updatedBy: userId,
        updatedAt: new Date()
      })
      .where(and(eq(complianceRules.id, id), eq(complianceRules.tenantId, tenantId)))
      .returning();

    // Log the update
    await logRuleChange(
      id,
      'updated',
      {
        fieldName: oldRule.fieldName,
        ruleType: oldRule.ruleType,
        value: oldRule.value,
        description: oldRule.description,
        isActive: oldRule.isActive
      },
      { fieldName, ruleType, value: processedValue, description, isActive },
      userId,
      tenantId,
      req.ip,
      req.get('User-Agent'),
      'Rule updated via admin interface'
    );

    console.log(`✅ Compliance rule updated: ${oldRule.ruleId}`);

    res.json({
      success: true,
      message: 'Rule updated successfully',
      data: updatedRule[0]
    });

  } catch (error) {
    console.error('Update compliance rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update compliance rule. Please try again.'
    });
  }
};

// Delete compliance rule
export const deleteComplianceRule = async (req, res) => {
  try {
    const { tenantId, userId } = req.user;
    const { id } = req.params;

    // Get existing rule
    const existingRule = await db
      .select()
      .from(complianceRules)
      .where(and(eq(complianceRules.id, id), eq(complianceRules.tenantId, tenantId)))
      .limit(1);

    if (!existingRule.length) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }

    const ruleToDelete = existingRule[0];

    // Delete the rule
    await db
      .delete(complianceRules)
      .where(and(eq(complianceRules.id, id), eq(complianceRules.tenantId, tenantId)));

    // Log the deletion
    await logRuleChange(
      id,
      'deleted',
      {
        ruleId: ruleToDelete.ruleId,
        fieldName: ruleToDelete.fieldName,
        ruleType: ruleToDelete.ruleType,
        value: ruleToDelete.value,
        description: ruleToDelete.description
      },
      null,
      userId,
      tenantId,
      req.ip,
      req.get('User-Agent'),
      'Rule deleted via admin interface'
    );

    console.log(`✅ Compliance rule deleted: ${ruleToDelete.ruleId}`);

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });

  } catch (error) {
    console.error('Delete compliance rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete compliance rule. Please try again.'
    });
  }
};

// Preview rule impact on existing documents
export const previewRuleImpact = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { fieldName, ruleType, value } = req.body;

    console.log(`🔍 Previewing rule impact: ${ruleType} on ${fieldName} for tenant ${tenantId}`);

    // Get sample documents for the tenant
    const sampleDocuments = await db
      .select({
        id: documents.id,
        filename: documents.filename,
        originalName: documents.originalName,
        fileSize: documents.fileSize,
        mimeType: documents.mimeType,
        createdAt: documents.createdAt
      })
      .from(documents)
      .where(eq(documents.tenantId, tenantId))
      .orderBy(desc(documents.createdAt))
      .limit(50); // Limit to 50 recent documents for preview

    // Simulate rule application
    const preview = {
      totalDocuments: sampleDocuments.length,
      compliant: 0,
      nonCompliant: 0,
      examples: []
    };

    for (const doc of sampleDocuments) {
      let isCompliant = true;
      let reason = '';

      // Simulate rule checking based on available document metadata
      switch (ruleType) {
        case 'required':
          // Check if required field has value (simulated - in real implementation, 
          // this would check extracted document content)
          if (fieldName === 'filename' && !doc.filename) {
            isCompliant = false;
            reason = 'Filename is required but missing';
          } else if (fieldName === 'originalName' && !doc.originalName) {
            isCompliant = false;
            reason = 'Original name is required but missing';
          }
          break;
          
        case 'format':
          // Check format using regex (simulated)
          if (fieldName === 'filename' || fieldName === 'originalName') {
            try {
              const regex = new RegExp(value);
              const testValue = fieldName === 'filename' ? doc.filename : doc.originalName;
              if (!regex.test(testValue)) {
                isCompliant = false;
                reason = `${fieldName} format does not match pattern: ${value}`;
              }
            } catch (error) {
              reason = 'Invalid regex pattern';
            }
          }
          break;
          
        case 'range':
          // Check range for file size
          if (fieldName === 'fileSize') {
            const [min, max] = value.split('-').map(Number);
            if (doc.fileSize < min || doc.fileSize > max) {
              isCompliant = false;
              reason = `File size ${doc.fileSize} bytes is outside range ${min}-${max}`;
            }
          }
          break;
          
        case 'length':
          // Check length constraints
          if (fieldName === 'filename' || fieldName === 'originalName') {
            const maxLength = parseInt(value);
            const testValue = fieldName === 'filename' ? doc.filename : doc.originalName;
            if (testValue && testValue.length > maxLength) {
              isCompliant = false;
              reason = `${fieldName} length ${testValue.length} exceeds maximum ${maxLength}`;
            }
          }
          break;
      }

      if (isCompliant) {
        preview.compliant++;
      } else {
        preview.nonCompliant++;
        // Add example of non-compliant document
        if (preview.examples.length < 5) {
          preview.examples.push({
            documentId: doc.id,
            filename: doc.filename,
            reason
          });
        }
      }
    }

    console.log(`✅ Rule preview completed: ${preview.compliant}/${preview.totalDocuments} compliant`);

    res.json({
      success: true,
      message: 'Rule impact preview generated successfully',
      data: {
        preview,
        ruleDetails: {
          fieldName,
          ruleType,
          value
        }
      }
    });

  } catch (error) {
    console.error('Preview rule impact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview rules. Please try again.'
    });
  }
};

// Get audit logs for compliance rules
export const getRuleAuditLogs = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { page = 1, limit = 20, ruleId = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = db
      .select({
        id: complianceRuleAuditLogs.id,
        ruleId: complianceRuleAuditLogs.ruleId,
        action: complianceRuleAuditLogs.action,
        oldValues: complianceRuleAuditLogs.oldValues,
        newValues: complianceRuleAuditLogs.newValues,
        changeReason: complianceRuleAuditLogs.changeReason,
        createdAt: complianceRuleAuditLogs.createdAt,
        changedByName: users.firstName,
        changedByLastName: users.lastName,
        changedByEmail: users.email,
        ruleDisplayId: complianceRules.ruleId
      })
      .from(complianceRuleAuditLogs)
      .leftJoin(users, eq(complianceRuleAuditLogs.changedBy, users.id))
      .leftJoin(complianceRules, eq(complianceRuleAuditLogs.ruleId, complianceRules.id))
      .where(eq(complianceRuleAuditLogs.tenantId, tenantId));

    if (ruleId) {
      query = query.where(eq(complianceRuleAuditLogs.ruleId, ruleId));
    }

    const auditLogs = await query
      .orderBy(desc(complianceRuleAuditLogs.createdAt))
      .limit(limit)
      .offset(skip);

    const formattedLogs = auditLogs.map(log => ({
      ...log,
      changedByName: log.changedByName && log.changedByLastName
        ? `${log.changedByName} ${log.changedByLastName}`
        : log.changedByEmail || 'Unknown User',
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null
    }));

    res.json({
      success: true,
      data: formattedLogs,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get rule audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
};