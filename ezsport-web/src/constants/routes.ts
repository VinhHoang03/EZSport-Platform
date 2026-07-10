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
  COACHES: '/coaches',
  COACH_DETAIL: '/coaches/:id',
  COACH_DASHBOARD: '/coach/dashboard',
  MESSAGES: '/messages',
  SHOPS: '/shops',
  SHOP_DETAIL: '/shops/:id',
  SHOP_CHECKOUT: '/shops/:id/checkout',

  // Booking flow
  BOOKING_SUCCESS_NEW: '/booking/success/:bookingId',
  MY_BOOKINGS: '/my-bookings',
  BOOKING_DETAIL: '/my-bookings/:bookingId',

  // Owner
  OWNER_PAGE: '/owner/page',

  // Shop
  SHOP_DASHBOARD: '/shop/dashboard',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const;
