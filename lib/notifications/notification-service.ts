/**
 * Notification Service
 * Integrates with WhatsApp (Twilio), SMS, and Email for consultation notifications
 */

import { NotificationPayload, NotificationResult, NotificationChannel } from '@/types/consultation';

// Environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox default

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<NotificationResult> {
  try {
    // In development, log instead of sending
    if (isDevelopment || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.log('[WhatsApp Mock]', {
        to,
        message,
        from: TWILIO_WHATSAPP_NUMBER,
      });
      return {
        success: true,
        messageId: `mock_wa_${Date.now()}`,
        channel: 'whatsapp',
      };
    }

    // Ensure phone number has whatsapp: prefix
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Use Twilio SDK
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_NUMBER,
          To: whatsappTo,
          Body: message,
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio WhatsApp error: ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.sid,
      channel: 'whatsapp',
    };
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return {
      success: false,
      channel: 'whatsapp',
      error: error.message,
    };
  }
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(to: string, message: string): Promise<NotificationResult> {
  try {
    // In development, log instead of sending
    if (isDevelopment || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.log('[SMS Mock]', {
        to,
        message,
        from: TWILIO_PHONE_NUMBER,
      });
      return {
        success: true,
        messageId: `mock_sms_${Date.now()}`,
        channel: 'sms',
      };
    }

    // Ensure phone number has + prefix
    const formattedTo = to.startsWith('+') ? to : `+${to}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: formattedTo,
          Body: message,
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio SMS error: ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.sid,
      channel: 'sms',
    };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return {
      success: false,
      channel: 'sms',
      error: error.message,
    };
  }
}

/**
 * Send email (stub - integrate with SendGrid, Resend, etc.)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<NotificationResult> {
  try {
    // In development, log instead of sending
    if (isDevelopment) {
      console.log('[Email Mock]', {
        to,
        subject,
        html: html.substring(0, 100) + '...',
      });
      return {
        success: true,
        messageId: `mock_email_${Date.now()}`,
        channel: 'email',
      };
    }

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // Example with fetch to a hypothetical email API:
    // const response = await fetch('https://api.emailservice.com/send', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${EMAIL_API_KEY}` },
    //   body: JSON.stringify({ to, subject, html }),
    // });

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      channel: 'email',
    };
  } catch (error: any) {
    console.error('Email send error:', error);
    return {
      success: false,
      channel: 'email',
      error: error.message,
    };
  }
}

/**
 * Send notification via the specified channel
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const { channel, to, message } = payload;

  switch (channel) {
    case 'whatsapp':
      return sendWhatsAppMessage(to, message);
    case 'sms':
      return sendSMS(to, message);
    case 'email':
      // For email, message is the subject, would need HTML body
      return sendEmail(to, 'GlowUp Consultation', message);
    default:
      return {
        success: false,
        channel,
        error: `Unknown channel: ${channel}`,
      };
  }
}

/**
 * Send notification with fallback channels
 * Tries primary channel first, falls back to SMS, then email
 */
export async function sendNotificationWithFallback(
  primaryChannel: NotificationChannel,
  phone: string,
  email: string,
  message: string
): Promise<NotificationResult> {
  // Try primary channel
  const primaryResult = await sendNotification({
    channel: primaryChannel,
    to: primaryChannel === 'email' ? email : phone,
    message,
  });

  if (primaryResult.success) {
    return primaryResult;
  }

  console.warn(
    `Primary channel ${primaryChannel} failed, trying fallback`,
    primaryResult.error
  );

  // Fallback to SMS if primary was WhatsApp
  if (primaryChannel === 'whatsapp') {
    const smsResult = await sendSMS(phone, message);
    if (smsResult.success) {
      return smsResult;
    }
  }

  // Final fallback to email
  const emailResult = await sendEmail(email, 'GlowUp Consultation', message);
  return emailResult;
}

/**
 * Replace template variables in message
 */
export function processTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return processed;
}

/**
 * Format phone number for Twilio (ensure E.164 format)
 */
export function formatPhoneNumber(phone: string, countryCode: string = '254'): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    cleaned = countryCode + cleaned.substring(1);
  }

  // If doesn't start with +, add it
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}
