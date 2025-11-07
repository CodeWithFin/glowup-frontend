/**
 * Calendar Service
 * Generates iCal (.ics) calendar invites for consultations
 */

import { ConsultationBooking } from '@/types/consultation';

/**
 * Generate iCal file content for a consultation booking
 */
export function generateICalInvite(booking: ConsultationBooking): string {
  const startDate = new Date(booking.scheduledStart);
  const endDate = new Date(booking.scheduledEnd);

  // Format dates to iCal format (YYYYMMDDTHHmmssZ)
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `consultation-${booking.id}@glowup.co.ke`;
  const dtstamp = formatDate(new Date());
  const dtstart = formatDate(startDate);
  const dtend = formatDate(endDate);

  const location = booking.meetingLink || 'Virtual Consultation';
  const description = [
    `Type: ${booking.type}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
    booking.concerns?.length ? `Concerns: ${booking.concerns.join(', ')}` : '',
    booking.meetingLink ? `Meeting Link: ${booking.meetingLink}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GlowUp Kenya//Consultation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${booking.type.replace(/_/g, ' ')} Consultation with ${booking.consultantName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    `ORGANIZER;CN=${booking.consultantName}:mailto:consultations@glowup.co.ke`,
    `ATTENDEE;CN=${booking.userName};RSVP=TRUE:mailto:${booking.userEmail}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Consultation in 24 hours',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Consultation in 1 hour',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ical;
}

/**
 * Generate cancellation iCal
 */
export function generateCancellationInvite(booking: ConsultationBooking): string {
  const startDate = new Date(booking.scheduledStart);
  const endDate = new Date(booking.scheduledEnd);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `consultation-${booking.id}@glowup.co.ke`;
  const dtstamp = formatDate(new Date());
  const dtstart = formatDate(startDate);
  const dtend = formatDate(endDate);

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GlowUp Kenya//Consultation//EN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:CANCELLED: ${booking.type.replace(/_/g, ' ')} Consultation`,
    `STATUS:CANCELLED`,
    `SEQUENCE:1`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return ical;
}

/**
 * Generate reminder text for notifications
 */
export function formatReminderTime(scheduledStart: number): {
  date: string;
  time: string;
  dayOfWeek: string;
} {
  const date = new Date(scheduledStart);

  const dayOfWeek = date.toLocaleDateString('en-KE', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    date: dateStr,
    time: timeStr,
    dayOfWeek,
  };
}

/**
 * Calculate if a reminder should be sent
 */
export function shouldSendReminder(
  scheduledStart: number,
  reminderType: '24h' | '1h',
  lastSent?: number
): boolean {
  const now = Date.now();
  const timeUntilConsultation = scheduledStart - now;

  // Already sent
  if (lastSent) {
    return false;
  }

  // 24 hour reminder: send if between 24h and 23h before
  if (reminderType === '24h') {
    const hours24 = 24 * 60 * 60 * 1000;
    const hours23 = 23 * 60 * 60 * 1000;
    return timeUntilConsultation <= hours24 && timeUntilConsultation > hours23;
  }

  // 1 hour reminder: send if between 1h and 50min before
  if (reminderType === '1h') {
    const hours1 = 60 * 60 * 1000;
    const min50 = 50 * 60 * 1000;
    return timeUntilConsultation <= hours1 && timeUntilConsultation > min50;
  }

  return false;
}

/**
 * Generate meeting link (stub - integrate with Zoom, Google Meet, etc.)
 */
export function generateMeetingLink(bookingId: string): string {
  // In production, integrate with video conferencing API
  // For now, return a placeholder
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Zoom/Google Meet API
    return `https://meet.glowup.co.ke/consultation/${bookingId}`;
  }

  return `https://meet.glowup.co.ke/consultation/${bookingId}`;
}
