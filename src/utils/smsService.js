const twilio = require('twilio');
const config = require('../config/config');

class SMSService {
  constructor() {
    this.client = null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    this.initializeClient();
  }

  initializeClient() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        this.client = twilio(accountSid, authToken);
        console.log('Twilio SMS client initialized successfully');
      } else {
        console.warn('Twilio credentials not found. SMS functionality will be limited.');
      }
    } catch (error) {
      console.error('Error initializing Twilio client:', error.message);
    }
  }

  async sendVerificationCode(phoneNumber, code) {
    try {
      if (!this.client) {
        console.warn('SMS client not available. OTP code:', code);
        return { success: false, message: 'SMS service not configured' };
      }

      // Format phone number (add country code if needed)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const message = await this.client.messages.create({
        body: `Your TailorMade verification code is: ${code}. Valid for 10 minutes.`,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`SMS sent successfully to ${formattedPhone}. SID: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Error sending SMS:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordReset(phoneNumber, resetToken) {
    try {
      if (!this.client) {
        console.warn('SMS client not available. Reset token:', resetToken);
        return { success: false, message: 'SMS service not configured' };
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const message = await this.client.messages.create({
        body: `Your TailorMade password reset code is: ${resetToken}. Valid for 10 minutes.`,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`Password reset SMS sent successfully to ${formattedPhone}. SID: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Error sending password reset SMS:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendOrderUpdate(phoneNumber, orderId, status) {
    try {
      if (!this.client) {
        console.warn('SMS client not available for order update');
        return { success: false, message: 'SMS service not configured' };
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const message = await this.client.messages.create({
        body: `Your TailorMade order #${orderId} status has been updated to: ${status}.`,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`Order update SMS sent successfully to ${formattedPhone}. SID: ${message.sid}`);
      return { success: true, messageId: message.sid };
    } catch (error) {
      console.error('Error sending order update SMS:', error.message);
      return { success: false, error: error.message };
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit number, assume it's Nigerian and add +234
    if (cleaned.length === 10) {
      return `+234${cleaned}`;
    }
    
    // If it already has country code, return as is
    if (cleaned.startsWith('234') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    // If it starts with +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Default: assume it's a Nigerian number
    return `+234${cleaned}`;
  }

  // Mock SMS for development/testing
  async sendMockSMS(phoneNumber, message) {
    console.log(`[MOCK SMS] To: ${phoneNumber}`);
    console.log(`[MOCK SMS] Message: ${message}`);
    console.log(`[MOCK SMS] Timestamp: ${new Date().toISOString()}`);
    return { success: true, messageId: 'mock-message-id' };
  }

  // Send SMS to a single number
  static async sendSMS(to, message) {
    try {
      const client = this.getClient();
      
      if (!client) {
        console.warn('Twilio credentials not configured. SMS will not be sent.');
        return { success: false, message: 'SMS service not configured' };
      }

      const result = await client.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to: to
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send order confirmation SMS
  static async sendOrderConfirmation(phone, orderNumber, shopName) {
    const message = `Your order ${orderNumber} has been confirmed by ${shopName}. We'll keep you updated on the progress. Thank you for choosing Tailormade!`;
    return await this.sendSMS(phone, message);
  }

  // Send order status update SMS
  static async sendOrderStatusUpdate(phone, orderNumber, status) {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed and work has begun.',
      'in_progress': 'Your order is currently being worked on.',
      'ready_for_fitting': 'Your order is ready for fitting. Please contact the shop.',
      'completed': 'Your order has been completed and is ready for pickup/delivery.'
    };

    const message = `Order ${orderNumber} status update: ${statusMessages[status] || status}`;
    return await this.sendSMS(phone, message);
  }

  // Send appointment reminder SMS
  static async sendAppointmentReminder(phone, shopName, date, time) {
    const message = `Reminder: You have an appointment at ${shopName} on ${date} at ${time}. Please arrive 10 minutes early.`;
    return await this.sendSMS(phone, message);
  }

  // Send delivery notification SMS
  static async sendDeliveryNotification(phone, orderNumber, estimatedTime) {
    const message = `Your order ${orderNumber} is out for delivery and will arrive around ${estimatedTime}. Please ensure someone is available to receive it.`;
    return await this.sendSMS(phone, message);
  }
}

module.exports = new SMSService(); 