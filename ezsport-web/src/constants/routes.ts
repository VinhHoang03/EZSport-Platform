export const ROUTES = {
  // Public
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Player
  VENUES: '/venues',
  MAP: '/map',
  COURT_DETAIL: '/venues/:id',
  VENUE_DETAIL: '/venues/:id',
  CHECKOUT: '/venues/:id/checkout',
  BOOKING_SUCCESS: '/booking-success',
  PROFILE: '/profile',
  PLAYMATES: '/playmates',

  // Booking flow (new)
  BOOKING: '/booking/:id',
  BOOKING_CONFIRM: '/booking/:id/confirm',
  BOOKING_SUCCESS_NEW: '/booking/success/:bookingId',
  MY_BOOKINGS: '/my-bookings',
  BOOKING_DETAIL: '/my-bookings/:bookingId',

  // Owner
  OWNER_PAGE: '/owner/page',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const;
