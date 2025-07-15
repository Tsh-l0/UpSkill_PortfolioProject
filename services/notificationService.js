const Notification = require("../models/Notification");
const emailService = require("./emailService");
const { cacheHelper } = require("../config/redis");

class NotificationService {
  constructor() {
    this.templates = {
      endorsement: {
        title: "New skill endorsement!",
        message: "{endorser} endorsed your {skill} skill",
        priority: "medium",
        category: "professional",
      },
      connection_request: {
        title: "New connection request",
        message: "{requester} wants to connect with you",
        priority: "medium",
        category: "social",
      },
      connection_accepted: {
        title: "Connection accepted!",
        message: "{user} accepted your connection request",
        priority: "low",
        category: "social",
      },
      profile_view: {
        title: "Profile viewed",
        message: "{viewer} viewed your profile",
        priority: "low",
        category: "social",
      },
      skill_trending: {
        title: "Your skill is trending!",
        message: "Your {skill} skill is trending in your network",
        priority: "low",
        category: "professional",
      },
      project_liked: {
        title: "Project liked",
        message: "{user} liked your project '{project}'",
        priority: "low",
        category: "professional",
      },
      achievement: {
        title: "Achievement unlocked!",
        message: "You've earned the '{achievement}' badge",
        priority: "medium",
        category: "system",
      },
    };
  }

  async createNotification(data) {
    try {
      const {
        recipientId,
        senderId,
        type,
        relatedId,
        relatedType,
        relatedData = {},
        deliveryMethod = "in-app",
        customMessage,
        customTitle,
      } = data;

      // Get template
      const template = this.templates[type];
      if (!template) {
        throw new Error(`Unknown notification type: ${type}`);
      }

      // Generate message from template
      const title =
        customTitle || this.processTemplate(template.title, relatedData);
      const message =
        customMessage || this.processTemplate(template.message, relatedData);

      // Generate action URL
      const actionUrl = this.generateActionUrl(type, relatedId, relatedType);

      // Create notification
      const notification = await Notification.create({
        recipientId,
        senderId,
        type,
        title,
        message,
        actionUrl,
        relatedId,
        relatedType,
        relatedData,
        priority: template.priority,
        category: template.category,
        deliveryMethod,
      });

      // Populate sender info
      await notification.populate("senderId", "fullName profileImage");

      // Send via different channels based on delivery method
      if (deliveryMethod === "email" || deliveryMethod === "both") {
        await this.sendEmailNotification(notification);
      }

      // Update cache
      await this.invalidateUserNotificationCache(recipientId);

      return notification;
    } catch (error) {
      console.error("Create notification error:", error);
      throw error;
    }
  }

  async createBulkNotifications(notifications) {
    try {
      const processedNotifications = notifications.map((data) => {
        const template = this.templates[data.type];
        return {
          ...data,
          title:
            data.customTitle ||
            this.processTemplate(template.title, data.relatedData || {}),
          message:
            data.customMessage ||
            this.processTemplate(template.message, data.relatedData || {}),
          actionUrl: this.generateActionUrl(
            data.type,
            data.relatedId,
            data.relatedType
          ),
          priority: template.priority,
          category: template.category,
        };
      });

      const createdNotifications = await Notification.insertMany(
        processedNotifications
      );

      // Invalidate cache for all recipients
      const recipientIds = [
        ...new Set(notifications.map((n) => n.recipientId)),
      ];
      await Promise.all(
        recipientIds.map((id) => this.invalidateUserNotificationCache(id))
      );

      return createdNotifications;
    } catch (error) {
      console.error("Create bulk notifications error:", error);
      throw error;
    }
  }

  processTemplate(template, data) {
    let processed = template;

    Object.entries(data).forEach(([key, value]) => {
      processed = processed.replace(`{${key}}`, value);
    });

    return processed;
  }

  generateActionUrl(type, relatedId, relatedType) {
    const urlMap = {
      endorsement: `/profile?tab=endorsements`,
      connection_request: `/connections?tab=requests`,
      connection_accepted: `/connections`,
      profile_view: `/profile`,
      skill_trending: `/skills/trending`,
      project_liked: `/projects/${relatedId}`,
      achievement: `/profile?tab=achievements`,
    };

    return urlMap[type] || `/dashboard`;
  }

  async sendEmailNotification(notification) {
    try {
      // Get recipient details
      const recipient = await notification.populate(
        "recipientId",
        "email fullName"
      );
      if (!recipient.recipientId.email) return;

      const emailData = {
        to: recipient.recipientId.email,
        subject: notification.title,
        html: this.generateEmailHTML(notification),
      };

      await emailService.sendEmail(emailData);

      // Mark as delivered
      notification.isDelivered = true;
      notification.deliveredAt = new Date();
      await notification.save({ validateBeforeSave: false });
    } catch (error) {
      console.error("Send email notification error:", error);

      // Mark delivery error
      notification.deliveryError = error.message;
      await notification.save({ validateBeforeSave: false });
    }
  }

  generateEmailHTML(notification) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <header style="background: #6366f1; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">${
            notification.title
          }</h1>
        </header>
        
        <main style="padding: 30px; background: #f8fafc;">
          <p style="color: #374151; line-height: 1.6; font-size: 16px;">
            ${notification.message}
          </p>
          
          ${
            notification.actionUrl
              ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}${notification.actionUrl}" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                View Details
              </a>
            </div>
          `
              : ""
          }
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            This is an automated notification from UpSkill Platform.
          </p>
        </main>
      </div>
    `;
  }

  async invalidateUserNotificationCache(userId) {
    const cacheKeys = [
      `notifications:user:${userId}`,
      `notifications:unread:${userId}`,
      `notifications:counts:${userId}`,
    ];

    await Promise.all(cacheKeys.map((key) => cacheHelper.del(key)));
  }

  // Convenience methods for common notifications
  async notifyEndorsement(endorseeId, endorserId, skillName, comment) {
    return this.createNotification({
      recipientId: endorseeId,
      senderId: endorserId,
      type: "endorsement",
      relatedData: {
        endorser: endorserId, // Will be populated
        skill: skillName,
        comment,
      },
    });
  }

  async notifyConnectionRequest(recipientId, requesterId, requesterName) {
    return this.createNotification({
      recipientId,
      senderId: requesterId,
      type: "connection_request",
      relatedId: requesterId,
      relatedType: "user",
      relatedData: {
        requester: requesterName,
      },
    });
  }

  async notifyConnectionAccepted(requesterId, recipientId, recipientName) {
    return this.createNotification({
      recipientId: requesterId,
      senderId: recipientId,
      type: "connection_accepted",
      relatedId: recipientId,
      relatedType: "user",
      relatedData: {
        user: recipientName,
      },
    });
  }

  async notifyProfileView(profileOwnerId, viewerId, viewerName) {
    // Don't spam with profile view notifications - limit to once per day per viewer
    const cacheKey = `profile_view:${profileOwnerId}:${viewerId}`;
    const alreadyNotified = await cacheHelper.exists(cacheKey);

    if (alreadyNotified) return null;

    // Set cache for 24 hours
    await cacheHelper.setex(cacheKey, 86400, "1");

    return this.createNotification({
      recipientId: profileOwnerId,
      senderId: viewerId,
      type: "profile_view",
      relatedId: viewerId,
      relatedType: "user",
      relatedData: {
        viewer: viewerName,
      },
    });
  }

  async notifyProjectLiked(projectOwnerId, likerId, likerName, projectTitle) {
    return this.createNotification({
      recipientId: projectOwnerId,
      senderId: likerId,
      type: "project_liked",
      relatedData: {
        user: likerName,
        project: projectTitle,
      },
    });
  }

  async notifyAchievement(userId, achievementName) {
    return this.createNotification({
      recipientId: userId,
      type: "achievement",
      relatedData: {
        achievement: achievementName,
      },
    });
  }
}

module.exports = new NotificationService();
