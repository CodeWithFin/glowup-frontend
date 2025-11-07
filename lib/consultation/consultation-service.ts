/**
 * Consultation Service
 * Manages consultation bookings, availability, and scheduling
 */

import { kv } from '@/lib/redis';
import { randomUUID } from 'crypto';
import {
  ConsultationBooking,
  CreateBookingInput,
  UpdateBookingInput,
  BookingQuery,
  BookingListResponse,
  TimeSlot,
  Availability,
  CONSULTATION_PRICE_KES,
  CONSULTATION_DURATION_MINUTES,
  BOOKING_MINIMUM_HOURS,
  BOOKING_ADVANCE_DAYS,
} from '@/types/consultation';

// Redis keys
const BOOKING_PREFIX = 'consultation:booking:';
const USER_BOOKINGS_PREFIX = 'consultation:user:';
const CONSULTANT_BOOKINGS_PREFIX = 'consultation:consultant:';
const DATE_BOOKINGS_PREFIX = 'consultation:date:';
const BOOKING_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

/**
 * Create a new consultation booking
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<ConsultationBooking> {
  const now = Date.now();
  const bookingId = randomUUID();

  // Validate booking time
  const minAdvanceTime = now + BOOKING_MINIMUM_HOURS * 60 * 60 * 1000;
  if (input.scheduledStart < minAdvanceTime) {
    throw new Error(
      `Bookings must be made at least ${BOOKING_MINIMUM_HOURS} hours in advance`
    );
  }

  const maxAdvanceTime = now + BOOKING_ADVANCE_DAYS * 24 * 60 * 60 * 1000;
  if (input.scheduledStart > maxAdvanceTime) {
    throw new Error(
      `Bookings can only be made up to ${BOOKING_ADVANCE_DAYS} days in advance`
    );
  }

  // Check for conflicts
  const hasConflict = await checkTimeSlotConflict(
    input.consultantId,
    input.scheduledStart,
    input.scheduledEnd
  );

  if (hasConflict) {
    throw new Error('This time slot is not available');
  }

  const booking: ConsultationBooking = {
    id: bookingId,
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    userPhone: input.userPhone,
    consultantId: input.consultantId,
    consultantName: '', // Will be populated from consultant lookup
    type: input.type,
    status: 'pending',
    scheduledStart: input.scheduledStart,
    scheduledEnd: input.scheduledEnd,
    duration:
      (input.scheduledEnd - input.scheduledStart) / (1000 * 60), // Convert to minutes
    notes: input.notes,
    concerns: input.concerns,
    preferredProducts: input.preferredProducts,
    notificationChannel: input.notificationChannel,
    notificationsSent: {},
    paymentStatus: 'pending',
    price: input.price || CONSULTATION_PRICE_KES,
    createdAt: now,
    updatedAt: now,
  };

  // Save booking
  const bookingKey = `${BOOKING_PREFIX}${bookingId}`;
  await kv.set(bookingKey, JSON.stringify(booking), BOOKING_TTL_SECONDS);

  // Index by user
  await addToIndex(`${USER_BOOKINGS_PREFIX}${input.userId}`, bookingId);

  // Index by consultant
  await addToIndex(
    `${CONSULTANT_BOOKINGS_PREFIX}${input.consultantId}`,
    bookingId
  );

  // Index by date (YYYY-MM-DD)
  const dateKey = new Date(input.scheduledStart).toISOString().split('T')[0];
  await addToIndex(`${DATE_BOOKINGS_PREFIX}${dateKey}`, bookingId);

  return booking;
}

/**
 * Get booking by ID
 */
export async function getBooking(bookingId: string): Promise<ConsultationBooking | null> {
  const key = `${BOOKING_PREFIX}${bookingId}`;
  const data = await kv.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
}

/**
 * Update booking
 */
export async function updateBooking(
  bookingId: string,
  updates: UpdateBookingInput
): Promise<ConsultationBooking | null> {
  const booking = await getBooking(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  const now = Date.now();

  // If rescheduling, check for conflicts
  if (updates.scheduledStart || updates.scheduledEnd) {
    const newStart = updates.scheduledStart || booking.scheduledStart;
    const newEnd = updates.scheduledEnd || booking.scheduledEnd;

    const hasConflict = await checkTimeSlotConflict(
      booking.consultantId,
      newStart,
      newEnd,
      bookingId // Exclude current booking from conflict check
    );

    if (hasConflict) {
      throw new Error('The new time slot is not available');
    }
  }

  const updatedBooking: ConsultationBooking = {
    ...booking,
    ...updates,
    updatedAt: now,
    cancelledAt: updates.status === 'cancelled' ? now : booking.cancelledAt,
    completedAt: updates.status === 'completed' ? now : booking.completedAt,
  };

  // Recalculate duration if times changed
  if (updates.scheduledStart || updates.scheduledEnd) {
    updatedBooking.duration =
      (updatedBooking.scheduledEnd - updatedBooking.scheduledStart) /
      (1000 * 60);
  }

  const key = `${BOOKING_PREFIX}${bookingId}`;
  await kv.set(key, JSON.stringify(updatedBooking), BOOKING_TTL_SECONDS);

  return updatedBooking;
}

/**
 * Cancel booking
 */
export async function cancelBooking(
  bookingId: string,
  reason?: string
): Promise<ConsultationBooking | null> {
  return updateBooking(bookingId, {
    status: 'cancelled',
    cancellationReason: reason,
  });
}

/**
 * List bookings with filtering
 */
export async function listBookings(
  query: BookingQuery = {}
): Promise<BookingListResponse> {
  const limit = query.limit || 20;
  const offset = query.offset || 0;

  let bookingIds: string[] = [];

  // Get bookings by user or consultant
  if (query.userId) {
    const indexRaw = await kv.get(`${USER_BOOKINGS_PREFIX}${query.userId}`);
    bookingIds = indexRaw ? JSON.parse(indexRaw) : [];
  } else if (query.consultantId) {
    const indexRaw = await kv.get(
      `${CONSULTANT_BOOKINGS_PREFIX}${query.consultantId}`
    );
    bookingIds = indexRaw ? JSON.parse(indexRaw) : [];
  } else {
    // If no specific user/consultant, would need a global index
    // For now, return empty (or implement global index)
    return {
      bookings: [],
      total: 0,
      limit,
      offset,
    };
  }

  // Fetch all bookings
  const bookings: ConsultationBooking[] = [];
  for (const id of bookingIds) {
    const booking = await getBooking(id);
    if (booking) {
      bookings.push(booking);
    }
  }

  // Apply filters
  let filtered = bookings;

  if (query.status) {
    filtered = filtered.filter((b) => b.status === query.status);
  }

  if (query.type) {
    filtered = filtered.filter((b) => b.type === query.type);
  }

  if (query.dateFrom) {
    filtered = filtered.filter((b) => b.scheduledStart >= query.dateFrom!);
  }

  if (query.dateTo) {
    filtered = filtered.filter((b) => b.scheduledStart <= query.dateTo!);
  }

  // Sort by scheduled time (descending)
  filtered.sort((a, b) => b.scheduledStart - a.scheduledStart);

  // Paginate
  const paginated = filtered.slice(offset, offset + limit);

  return {
    bookings: paginated,
    total: filtered.length,
    limit,
    offset,
  };
}

/**
 * Check if a time slot has a conflict
 */
export async function checkTimeSlotConflict(
  consultantId: string,
  start: number,
  end: number,
  excludeBookingId?: string
): Promise<boolean> {
  const dateKey = new Date(start).toISOString().split('T')[0];
  const indexRaw = await kv.get(`${DATE_BOOKINGS_PREFIX}${dateKey}`);
  const bookingIds: string[] = indexRaw ? JSON.parse(indexRaw) : [];

  for (const id of bookingIds) {
    if (id === excludeBookingId) continue;

    const booking = await getBooking(id);
    if (!booking) continue;

    // Check if same consultant
    if (booking.consultantId !== consultantId) continue;

    // Check if cancelled or completed
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      continue;
    }

    // Check for time overlap
    const hasOverlap =
      (start >= booking.scheduledStart && start < booking.scheduledEnd) ||
      (end > booking.scheduledStart && end <= booking.scheduledEnd) ||
      (start <= booking.scheduledStart && end >= booking.scheduledEnd);

    if (hasOverlap) {
      return true;
    }
  }

  return false;
}

/**
 * Get available time slots for a consultant on a specific date
 */
export async function getAvailableSlots(
  consultantId: string,
  date: string // YYYY-MM-DD
): Promise<Availability> {
  const slots: TimeSlot[] = [];

  // Define working hours (9 AM to 5 PM)
  const workStart = 9;
  const workEnd = 17;
  const slotDuration = CONSULTATION_DURATION_MINUTES;

  // Parse date
  const dateObj = new Date(date + 'T00:00:00');
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();

  // Generate time slots
  for (let hour = workStart; hour < workEnd; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(year, month, day, hour, minute).getTime();
      const slotEnd = slotStart + slotDuration * 60 * 1000;

      // Don't show slots in the past
      if (slotStart < Date.now()) {
        continue;
      }

      // Check if slot is available
      const hasConflict = await checkTimeSlotConflict(
        consultantId,
        slotStart,
        slotEnd
      );

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !hasConflict,
        consultantId,
      });
    }
  }

  return {
    consultantId,
    date,
    slots,
  };
}

/**
 * Get upcoming bookings (for reminder processing)
 */
export async function getUpcomingBookings(
  hoursAhead: number = 24
): Promise<ConsultationBooking[]> {
  // This would require a time-based index in production
  // For now, return empty array (stub for reminder processor)
  // TODO: Implement time-based indexing for efficient reminder queries
  return [];
}

/**
 * Helper: Add booking ID to an index
 */
async function addToIndex(indexKey: string, bookingId: string): Promise<void> {
  const existing = await kv.get(indexKey);
  const ids: string[] = existing ? JSON.parse(existing) : [];

  if (!ids.includes(bookingId)) {
    ids.push(bookingId);
    await kv.set(indexKey, JSON.stringify(ids), BOOKING_TTL_SECONDS);
  }
}

/**
 * Helper: Remove booking ID from an index
 */
async function removeFromIndex(
  indexKey: string,
  bookingId: string
): Promise<void> {
  const existing = await kv.get(indexKey);
  if (!existing) return;

  const ids: string[] = JSON.parse(existing);
  const filtered = ids.filter((id) => id !== bookingId);

  if (filtered.length > 0) {
    await kv.set(indexKey, JSON.stringify(filtered), BOOKING_TTL_SECONDS);
  } else {
    await kv.del(indexKey);
  }
}
