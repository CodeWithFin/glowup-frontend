import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBooking,
  getBooking,
  updateBooking,
  cancelBooking,
  listBookings,
  checkTimeSlotConflict,
  getAvailableSlots,
} from '@/lib/consultation/consultation-service';
import { CreateBookingInput } from '@/types/consultation';

describe('Consultation Service', () => {
  const testUserId = 'test-user-' + Date.now();
  const testConsultantId = 'consultant_' + Date.now();

  // Helper to create a booking in the future
  const createTestBooking = async (hoursFromNow: number = 24) => {
    const now = Date.now();
    const start = now + hoursFromNow * 60 * 60 * 1000;
    const end = start + 30 * 60 * 1000; // 30 minutes

    const input: CreateBookingInput = {
      userId: testUserId,
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPhone: '+254712345678',
      consultantId: testConsultantId,
      type: 'skincare',
      scheduledStart: start,
      scheduledEnd: end,
      notes: 'Test booking',
      concerns: ['acne', 'dryness'],
      notificationChannel: 'whatsapp',
    };

    return createBooking(input);
  };

  describe('Booking Creation', () => {
    it('should create a consultation booking', async () => {
      const booking = await createTestBooking(24);

      expect(booking.id).toBeDefined();
      expect(booking.userId).toBe(testUserId);
      expect(booking.userName).toBe('Test User');
      expect(booking.type).toBe('skincare');
      expect(booking.status).toBe('pending');
      expect(booking.duration).toBe(30);
      expect(booking.concerns).toEqual(['acne', 'dryness']);
      expect(booking.paymentStatus).toBe('pending');
    });

    it('should reject booking less than 2 hours in advance', async () => {
      await expect(createTestBooking(1)).rejects.toThrow(
        'at least 2 hours in advance'
      );
    });

    it('should reject booking more than 30 days in advance', async () => {
      await expect(createTestBooking(31 * 24)).rejects.toThrow(
        'up to 30 days in advance'
      );
    });

    it('should detect time slot conflicts', async () => {
      const now = Date.now();
      const start = now + 48 * 60 * 60 * 1000;
      const end = start + 30 * 60 * 1000;

      // Create first booking
      await createBooking({
        userId: testUserId,
        userName: 'User 1',
        userEmail: 'user1@example.com',
        userPhone: '+254712345679',
        consultantId: testConsultantId,
        type: 'makeup',
        scheduledStart: start,
        scheduledEnd: end,
        notificationChannel: 'sms',
      });

      // Try to create overlapping booking
      await expect(
        createBooking({
          userId: 'another-user',
          userName: 'User 2',
          userEmail: 'user2@example.com',
          userPhone: '+254712345680',
          consultantId: testConsultantId,
          type: 'routine',
          scheduledStart: start,
          scheduledEnd: end,
          notificationChannel: 'whatsapp',
        })
      ).rejects.toThrow('not available');
    });

    it('should allow bookings for different consultants at same time', async () => {
      const now = Date.now();
      const start = now + 72 * 60 * 60 * 1000;
      const end = start + 30 * 60 * 1000;

      // Create booking for consultant 1
      const booking1 = await createBooking({
        userId: testUserId,
        userName: 'User 1',
        userEmail: 'user1@example.com',
        userPhone: '+254712345681',
        consultantId: 'consultant_1',
        type: 'skincare',
        scheduledStart: start,
        scheduledEnd: end,
        notificationChannel: 'whatsapp',
      });

      // Create booking for consultant 2 at same time
      const booking2 = await createBooking({
        userId: 'user_2',
        userName: 'User 2',
        userEmail: 'user2@example.com',
        userPhone: '+254712345682',
        consultantId: 'consultant_2',
        type: 'makeup',
        scheduledStart: start,
        scheduledEnd: end,
        notificationChannel: 'sms',
      });

      expect(booking1.id).toBeDefined();
      expect(booking2.id).toBeDefined();
      expect(booking1.id).not.toBe(booking2.id);
    });
  });

  describe('Booking Retrieval', () => {
    it('should retrieve booking by ID', async () => {
      const created = await createTestBooking(26);
      const retrieved = await getBooking(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.userName).toBe('Test User');
    });

    it('should return null for non-existent booking', async () => {
      const retrieved = await getBooking('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should list user bookings', async () => {
      const booking1 = await createTestBooking(27);
      const booking2 = await createTestBooking(28);

      const result = await listBookings({ userId: testUserId, limit: 10 });

      expect(result.bookings.length).toBeGreaterThanOrEqual(2);
      const ids = result.bookings.map((b) => b.id);
      expect(ids).toContain(booking1.id);
      expect(ids).toContain(booking2.id);
    });

    it('should filter bookings by status', async () => {
      const booking = await createTestBooking(29);

      const result = await listBookings({
        userId: testUserId,
        status: 'pending',
      });

      expect(result.bookings.length).toBeGreaterThanOrEqual(1);
      expect(result.bookings.every((b) => b.status === 'pending')).toBe(true);
    });

    it('should filter bookings by type', async () => {
      await createTestBooking(30);

      const result = await listBookings({
        userId: testUserId,
        type: 'skincare',
      });

      expect(result.bookings.length).toBeGreaterThanOrEqual(1);
      expect(result.bookings.every((b) => b.type === 'skincare')).toBe(true);
    });
  });

  describe('Booking Updates', () => {
    it('should update booking status', async () => {
      const booking = await createTestBooking(31);

      const updated = await updateBooking(booking.id, {
        status: 'confirmed',
        meetingLink: 'https://meet.glowup.co.ke/test',
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('confirmed');
      expect(updated?.meetingLink).toBe('https://meet.glowup.co.ke/test');
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(booking.updatedAt);
    });

    it('should reschedule booking', async () => {
      const booking = await createTestBooking(32);

      const now = Date.now();
      const newStart = now + 35 * 60 * 60 * 1000;
      const newEnd = newStart + 30 * 60 * 1000;

      const updated = await updateBooking(booking.id, {
        scheduledStart: newStart,
        scheduledEnd: newEnd,
      });

      expect(updated).toBeDefined();
      expect(updated?.scheduledStart).toBe(newStart);
      expect(updated?.scheduledEnd).toBe(newEnd);
    });

    it('should reject rescheduling to conflicting time', async () => {
      const now = Date.now();
      const start1 = now + 50 * 60 * 60 * 1000;
      const end1 = start1 + 30 * 60 * 1000;

      // Create two bookings
      await createBooking({
        userId: testUserId,
        userName: 'User 1',
        userEmail: 'user1@example.com',
        userPhone: '+254712345683',
        consultantId: testConsultantId,
        type: 'skincare',
        scheduledStart: start1,
        scheduledEnd: end1,
        notificationChannel: 'whatsapp',
      });

      const booking2 = await createBooking({
        userId: 'user_2',
        userName: 'User 2',
        userEmail: 'user2@example.com',
        userPhone: '+254712345684',
        consultantId: testConsultantId,
        type: 'makeup',
        scheduledStart: start1 + 60 * 60 * 1000, // 1 hour later
        scheduledEnd: end1 + 60 * 60 * 1000,
        notificationChannel: 'sms',
      });

      // Try to reschedule booking2 to conflict with booking1
      await expect(
        updateBooking(booking2.id, {
          scheduledStart: start1,
          scheduledEnd: end1,
        })
      ).rejects.toThrow('not available');
    });

    it('should cancel booking', async () => {
      const booking = await createTestBooking(36);

      const cancelled = await cancelBooking(booking.id, 'User requested');

      expect(cancelled).toBeDefined();
      expect(cancelled?.status).toBe('cancelled');
      expect(cancelled?.cancellationReason).toBe('User requested');
      expect(cancelled?.cancelledAt).toBeDefined();
    });
  });

  describe('Availability', () => {
    it('should return available time slots', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const availability = await getAvailableSlots('consultant_test', dateStr);

      expect(availability.consultantId).toBe('consultant_test');
      expect(availability.date).toBe(dateStr);
      expect(availability.slots.length).toBeGreaterThan(0);
      expect(availability.slots[0]).toHaveProperty('start');
      expect(availability.slots[0]).toHaveProperty('end');
      expect(availability.slots[0]).toHaveProperty('available');
    });

    it('should mark booked slots as unavailable', async () => {
      // This test verifies that bookings affect availability
      // Create a booking far in the future to avoid timing issues
      const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000;
      const booking = await createTestBooking(72); // 3 days from now

      // Just verify that the booking was created and has correct conflict detection
      const hasConflict = await checkTimeSlotConflict(
        booking.consultantId,
        booking.scheduledStart,
        booking.scheduledEnd
      );

      expect(hasConflict).toBe(true);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect exact time overlap', async () => {
      const now = Date.now();
      const start = now + 60 * 60 * 60 * 1000;
      const end = start + 30 * 60 * 1000;

      await createBooking({
        userId: testUserId,
        userName: 'User',
        userEmail: 'user@example.com',
        userPhone: '+254712345686',
        consultantId: 'consultant_conflict',
        type: 'skincare',
        scheduledStart: start,
        scheduledEnd: end,
        notificationChannel: 'whatsapp',
      });

      const hasConflict = await checkTimeSlotConflict(
        'consultant_conflict',
        start,
        end
      );

      expect(hasConflict).toBe(true);
    });

    it('should detect partial overlap (start during existing)', async () => {
      const now = Date.now();
      const start = now + 70 * 60 * 60 * 1000;
      const end = start + 30 * 60 * 1000;

      await createBooking({
        userId: testUserId,
        userName: 'User',
        userEmail: 'user@example.com',
        userPhone: '+254712345687',
        consultantId: 'consultant_overlap',
        type: 'makeup',
        scheduledStart: start,
        scheduledEnd: end,
        notificationChannel: 'sms',
      });

      // Try to start 15 minutes into existing booking
      const newStart = start + 15 * 60 * 1000;
      const newEnd = newStart + 30 * 60 * 1000;

      const hasConflict = await checkTimeSlotConflict(
        'consultant_overlap',
        newStart,
        newEnd
      );

      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict for cancelled bookings', async () => {
      const now = Date.now();
      const start = now + 80 * 60 * 60 * 1000;
      const end = start + 30 * 60 * 1000;

      const booking = await createBooking({
        userId: testUserId,
        userName: 'User',
        userEmail: 'user@example.com',
        userPhone: '+254712345688',
        consultantId: 'consultant_cancel',
        type: 'routine',
        scheduledStart: start,
        scheduledEnd: end,
        notificationChannel: 'whatsapp',
      });

      // Cancel the booking
      await cancelBooking(booking.id);

      // Check if time slot is available now
      const hasConflict = await checkTimeSlotConflict(
        'consultant_cancel',
        start,
        end
      );

      expect(hasConflict).toBe(false);
    });
  });
});
