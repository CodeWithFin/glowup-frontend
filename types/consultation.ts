/**
 * Consultation & Booking Types
 * Defines the structure for virtual beauty consultations
 */

export type ConsultationType = 'skincare' | 'makeup' | 'routine' | 'product_recommendation';

export type ConsultationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'completed' 
  | 'cancelled' 
  | 'no_show';

export type NotificationChannel = 'whatsapp' | 'sms' | 'email';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface TimeSlot {
  start: number; // timestamp
  end: number;   // timestamp
  available: boolean;
  consultantId?: string;
}

export interface Consultant {
  id: string;
  name: string;
  specialties: ConsultationType[];
  bio?: string;
  avatar?: string;
  rating?: number;
  consultationsCompleted?: number;
}

export interface Availability {
  consultantId: string;
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

export interface ConsultationBooking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  consultantId: string;
  consultantName: string;
  type: ConsultationType;
  status: ConsultationStatus;
  scheduledStart: number;
  scheduledEnd: number;
  duration: number; // minutes
  notes?: string;
  concerns?: string[];
  preferredProducts?: string[];
  notificationChannel: NotificationChannel;
  notificationsSent: {
    confirmation?: number; // timestamp
    reminder24h?: number;
    reminder1h?: number;
  };
  meetingLink?: string;
  paymentStatus: PaymentStatus;
  price: number; // KES
  createdAt: number;
  updatedAt: number;
  cancelledAt?: number;
  cancellationReason?: string;
  completedAt?: number;
  consultationNotes?: string; // Post-consultation notes
  followUpRequired?: boolean;
}

export interface CreateBookingInput {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  consultantId: string;
  type: ConsultationType;
  scheduledStart: number;
  scheduledEnd: number;
  notes?: string;
  concerns?: string[];
  preferredProducts?: string[];
  notificationChannel: NotificationChannel;
  price?: number;
}

export interface UpdateBookingInput {
  status?: ConsultationStatus;
  scheduledStart?: number;
  scheduledEnd?: number;
  notes?: string;
  meetingLink?: string;
  consultationNotes?: string;
  followUpRequired?: boolean;
  cancellationReason?: string;
}

export interface BookingQuery {
  userId?: string;
  consultantId?: string;
  status?: ConsultationStatus;
  type?: ConsultationType;
  dateFrom?: number; // timestamp
  dateTo?: number;   // timestamp
  limit?: number;
  offset?: number;
}

export interface BookingListResponse {
  bookings: ConsultationBooking[];
  total: number;
  limit: number;
  offset: number;
}

export interface NotificationPayload {
  channel: NotificationChannel;
  to: string; // phone or email
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  channel: NotificationChannel;
  error?: string;
}

// Constants
export const CONSULTATION_DURATION_MINUTES = 30;
export const CONSULTATION_PRICE_KES = 1500; // Default price
export const REMINDER_24H_SECONDS = 24 * 60 * 60;
export const REMINDER_1H_SECONDS = 60 * 60;
export const BOOKING_ADVANCE_DAYS = 30; // Can book up to 30 days in advance
export const BOOKING_MINIMUM_HOURS = 2; // Must book at least 2 hours in advance

export const CONSULTATION_TYPES: Record<ConsultationType, string> = {
  skincare: 'Skincare Consultation',
  makeup: 'Makeup Consultation',
  routine: 'Routine Building',
  product_recommendation: 'Product Recommendations',
};

export const NOTIFICATION_TEMPLATES = {
  booking_confirmation: {
    whatsapp: 'Hi {{name}}! Your {{type}} consultation is confirmed for {{date}} at {{time}}. Meeting link: {{link}}',
    sms: 'GlowUp: Your {{type}} consultation is confirmed for {{date}} at {{time}}. Link sent via email.',
    email: 'Your consultation is confirmed',
  },
  reminder_24h: {
    whatsapp: 'Reminder: Your {{type}} consultation with {{consultant}} is tomorrow at {{time}}. Meeting link: {{link}}',
    sms: 'GlowUp Reminder: Consultation tomorrow at {{time}}. Check email for link.',
    email: 'Reminder: Consultation in 24 hours',
  },
  reminder_1h: {
    whatsapp: 'Starting soon! Your {{type}} consultation begins in 1 hour. Join here: {{link}}',
    sms: 'GlowUp: Consultation starts in 1 hour. Check email for link.',
    email: 'Reminder: Consultation starting soon',
  },
  cancellation: {
    whatsapp: 'Your consultation scheduled for {{date}} at {{time}} has been cancelled. Reason: {{reason}}',
    sms: 'GlowUp: Your consultation on {{date}} has been cancelled.',
    email: 'Consultation cancelled',
  },
};
