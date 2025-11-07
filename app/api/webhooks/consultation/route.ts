import { NextRequest, NextResponse } from 'next/server';
import { getBooking, updateBooking, getUpcomingBookings } from '@/lib/consultation/consultation-service';
import { shouldSendReminder, formatReminderTime } from '@/lib/consultation/calendar-service';
import { sendNotificationWithFallback, processTemplate, formatPhoneNumber } from '@/lib/notifications/notification-service';
import { NOTIFICATION_TEMPLATES } from '@/types/consultation';

/**
 * POST /api/webhooks/consultation
 * Process consultation reminders and notifications
 * This should be called by a cron job or scheduler
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.CONSULTATION_WEBHOOK_SECRET || 'dev-secret';

    if (authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, bookingId } = body;

    switch (action) {
      case 'send_reminder_24h':
        return await sendReminder24h(bookingId);
      
      case 'send_reminder_1h':
        return await sendReminder1h(bookingId);
      
      case 'process_reminders':
        return await processAllReminders();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Send 24-hour reminder for a specific booking
 */
async function sendReminder24h(bookingId: string) {
  const booking = await getBooking(bookingId);

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Check if booking is still active
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return NextResponse.json(
      { message: 'Booking not active', skipped: true }
    );
  }

  // Check if should send
  if (!shouldSendReminder(booking.scheduledStart, '24h', booking.notificationsSent.reminder24h)) {
    return NextResponse.json(
      { message: 'Not time to send 24h reminder yet', skipped: true }
    );
  }

  // Format time
  const { date, time } = formatReminderTime(booking.scheduledStart);

  // Get template
  const template = NOTIFICATION_TEMPLATES.reminder_24h[booking.notificationChannel];
  const message = processTemplate(template, {
    name: booking.userName,
    type: booking.type.replace(/_/g, ' '),
    consultant: booking.consultantName,
    date,
    time,
    link: booking.meetingLink || 'Check your email',
  });

  // Send notification
  const formattedPhone = formatPhoneNumber(booking.userPhone);
  const result = await sendNotificationWithFallback(
    booking.notificationChannel,
    formattedPhone,
    booking.userEmail,
    message
  );

  // Update booking
  if (result.success) {
    // Note: notificationsSent would need to be added to UpdateBookingInput
    // For now, we'll update the booking manually
    booking.notificationsSent.reminder24h = Date.now();
    const bookingKey = `consultation:booking:${bookingId}`;
    const { kv } = await import('@/lib/redis');
    await kv.set(bookingKey, JSON.stringify(booking), 90 * 24 * 60 * 60);
  }

  return NextResponse.json({
    success: result.success,
    channel: result.channel,
    messageId: result.messageId,
  });
}

/**
 * Send 1-hour reminder for a specific booking
 */
async function sendReminder1h(bookingId: string) {
  const booking = await getBooking(bookingId);

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  // Check if booking is still active
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return NextResponse.json(
      { message: 'Booking not active', skipped: true }
    );
  }

  // Check if should send
  if (!shouldSendReminder(booking.scheduledStart, '1h', booking.notificationsSent.reminder1h)) {
    return NextResponse.json(
      { message: 'Not time to send 1h reminder yet', skipped: true }
    );
  }

  // Format time
  const { time } = formatReminderTime(booking.scheduledStart);

  // Get template
  const template = NOTIFICATION_TEMPLATES.reminder_1h[booking.notificationChannel];
  const message = processTemplate(template, {
    type: booking.type.replace(/_/g, ' '),
    time,
    link: booking.meetingLink || 'Check your email',
  });

  // Send notification
  const formattedPhone = formatPhoneNumber(booking.userPhone);
  const result = await sendNotificationWithFallback(
    booking.notificationChannel,
    formattedPhone,
    booking.userEmail,
    message
  );

  // Update booking
  if (result.success) {
    // Update notification timestamp manually
    booking.notificationsSent.reminder1h = Date.now();
    const bookingKey = `consultation:booking:${bookingId}`;
    const { kv } = await import('@/lib/redis');
    await kv.set(bookingKey, JSON.stringify(booking), 90 * 24 * 60 * 60);
  }

  return NextResponse.json({
    success: result.success,
    channel: result.channel,
    messageId: result.messageId,
  });
}

/**
 * Process all upcoming reminders (called by cron)
 */
async function processAllReminders() {
  // Get bookings in next 25 hours for 24h reminders
  // Get bookings in next 2 hours for 1h reminders
  // This is a stub - would need efficient time-based queries in production
  
  const upcomingBookings = await getUpcomingBookings(25);
  
  const results = {
    reminders24h: 0,
    reminders1h: 0,
    errors: 0,
  };

  for (const booking of upcomingBookings) {
    try {
      // Try 24h reminder
      if (shouldSendReminder(booking.scheduledStart, '24h', booking.notificationsSent.reminder24h)) {
        await sendReminder24h(booking.id);
        results.reminders24h++;
      }

      // Try 1h reminder
      if (shouldSendReminder(booking.scheduledStart, '1h', booking.notificationsSent.reminder1h)) {
        await sendReminder1h(booking.id);
        results.reminders1h++;
      }
    } catch (error) {
      console.error(`Error processing reminders for booking ${booking.id}:`, error);
      results.errors++;
    }
  }

  return NextResponse.json({
    processed: upcomingBookings.length,
    ...results,
  });
}
