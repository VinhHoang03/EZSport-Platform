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
  CHECKOUT: '/venues/:id/checkout',
  BOOKING_SUCCESS: '/booking-success',
  PROFILE: '/profile',
  PLAYMATES: '/playmates',

  // Owner
  OWNER_DASHBOARD: '/owner/dashboard',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const;
