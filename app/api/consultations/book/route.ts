import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createBooking } from '@/lib/consultation/consultation-service';
import { generateMeetingLink } from '@/lib/consultation/calendar-service';
import { sendNotificationWithFallback, processTemplate, formatPhoneNumber } from '@/lib/notifications/notification-service';
import { NOTIFICATION_TEMPLATES } from '@/types/consultation';
import { CreateBookingInput } from '@/types/consultation';

/**
 * POST /api/consultations/book
 * Create a new consultation booking
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('glowup_token');

    if (!token?.value) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to book a consultation' },
        { status: 401 }
      );
    }

    // TODO: Extract userId from token
    const userId = 'user_123';

    const body = await request.json();
    const input: CreateBookingInput = {
      userId,
      userName: body.userName,
      userEmail: body.userEmail,
      userPhone: body.userPhone,
      consultantId: body.consultantId || 'consultant_default',
      type: body.type,
      scheduledStart: body.scheduledStart,
      scheduledEnd: body.scheduledEnd,
      notes: body.notes,
      concerns: body.concerns,
      preferredProducts: body.preferredProducts,
      notificationChannel: body.notificationChannel || 'whatsapp',
      price: body.price,
    };

    // Validation
    if (!input.userName || !input.userEmail || !input.userPhone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (!input.type || !input.scheduledStart || !input.scheduledEnd) {
      return NextResponse.json(
        { error: 'Type, start time, and end time are required' },
        { status: 400 }
      );
    }

    if (input.scheduledStart >= input.scheduledEnd) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await createBooking(input);

    // Generate meeting link
    const meetingLink = generateMeetingLink(booking.id);
    booking.meetingLink = meetingLink;

    // Format date/time for notification
    const startDate = new Date(booking.scheduledStart);
    const dateStr = startDate.toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = startDate.toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Send confirmation notification
    const template =
      NOTIFICATION_TEMPLATES.booking_confirmation[input.notificationChannel];
    const message = processTemplate(template, {
      name: booking.userName,
      type: booking.type.replace(/_/g, ' '),
      date: dateStr,
      time: timeStr,
      link: meetingLink,
    });

    const formattedPhone = formatPhoneNumber(booking.userPhone);

    // Send with fallback
    const notificationResult = await sendNotificationWithFallback(
      input.notificationChannel,
      formattedPhone,
      booking.userEmail,
      message
    );

    if (notificationResult.success) {
      // Update booking with notification sent timestamp
      booking.notificationsSent.confirmation = Date.now();
      // TODO: Update booking in Redis with notification timestamp
    }

    return NextResponse.json(
      {
        booking,
        notification: {
          sent: notificationResult.success,
          channel: notificationResult.channel,
          messageId: notificationResult.messageId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
