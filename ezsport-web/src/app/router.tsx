import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import PlayerLayout from '../layouts/PlayerLayout';
import OwnerLayout from '../layouts/OwnerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/shared/ProtectedRoute';

// Lazy load pages
const LandingPage           = lazy(() => import('../pages/public/LandingPage'));
const LoginPage             = lazy(() => import('../pages/public/LoginPage'));
const RegisterPage          = lazy(() => import('../pages/public/RegisterPage'));
const ForgotPasswordPage    = lazy(() => import('../pages/public/ForgotPasswordPage'));
const ResetPasswordPage     = lazy(() => import('../components/auth/ResetPasswordPage'));
const MapPage               = lazy(() => import('../pages/player/MapPage'));
const VenueListPage         = lazy(() => import('../pages/player/venues/VenueListPage'));
const VenueDetailPage       = lazy(() => import('../pages/player/venues/VenueDetailPage'));
const CheckoutPageWrapper   = lazy(() => import('../pages/player/CheckoutPageWrapper'));
const BookingSuccessPage    = lazy(() => import('../pages/player/booking/BookingSuccessPage'));
const MyBookingsPage        = lazy(() => import('../pages/player/booking/MyBookingsPage'));
const BookingDetailPage     = lazy(() => import('../pages/player/booking/BookingDetailPage'));
const ProfilePageWrapper    = lazy(() => import('../pages/player/ProfilePageWrapper'));
const PlaymatesWrapper      = lazy(() => import('../pages/player/PlaymatesWrapper'));
const PlayerMessage         = lazy(() => import('../pages/player/chats/PlayerMessage'));
const OwnerPageWrapper      = lazy(() => import('../pages/owner/OwnerPageWrapper'));
const AdminDashboardWrapper = lazy(() => import('../pages/admin/AdminDashboardWrapper'));

const Loader = () => (
  <div className="min-vh-100 d-flex align-items-center justify-content-center">
    <div className="spinner-border text-success" role="status" />
  </div>
);

// Helper to wrap with Suspense
const s = (Component: React.ComponentType) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  // ── Public ──
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LANDING,          element: s(LandingPage) },
      { path: ROUTES.LOGIN,            element: s(LoginPage) },
      { path: ROUTES.REGISTER,         element: s(RegisterPage) },
      { path: ROUTES.FORGOT_PASSWORD,  element: s(ForgotPasswordPage) },
      { path: ROUTES.RESET_PASSWORD,   element: s(ResetPasswordPage) },
    ],
  },

  // ── Player: Map (App.tsx has its own full layout — no PlayerLayout wrapper) ──
  {
    element: <ProtectedRoute allowedRoles={['player']} />,
    children: [
      { path: ROUTES.MAP, element: s(MapPage) },
    ],
  },

  // ── Player: Other pages (use PlayerLayout with shared Navigation) ──
  {
    element: <ProtectedRoute allowedRoles={['player']} />,
    children: [{
      element: <PlayerLayout />,
      children: [
        { path: ROUTES.VENUES,          element: s(VenueListPage) },
        { path: ROUTES.VENUE_DETAIL,    element: s(VenueDetailPage) },
        { path: ROUTES.CHECKOUT,        element: s(CheckoutPageWrapper) },
        { path: ROUTES.BOOKING_SUCCESS, element: s(BookingSuccessPage) },
        { path: ROUTES.PROFILE,         element: s(ProfilePageWrapper) },
        { path: ROUTES.PLAYMATES,       element: s(PlaymatesWrapper) },
        { path: ROUTES.MESSAGES,        element: s(PlayerMessage) },
        // New booking flow
        { path: ROUTES.BOOKING_SUCCESS_NEW,  element: s(BookingSuccessPage) },
        { path: '/booking/success',          element: s(BookingSuccessPage) },
        { path: ROUTES.MY_BOOKINGS,          element: s(MyBookingsPage) },
        { path: ROUTES.BOOKING_DETAIL,       element: s(BookingDetailPage) },
      ],
    }],
  },

  // ── Owner ──
  {
    element: <ProtectedRoute allowedRoles={['owner']} />,
    children: [{
      element: <OwnerLayout />,
      children: [
        { path: ROUTES.OWNER_PAGE, element: s(OwnerPageWrapper) },
      ],
    }],
  },

  // ── Admin ──
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [{
      element: <AdminLayout />,
      children: [
        { path: ROUTES.ADMIN_DASHBOARD, element: s(AdminDashboardWrapper) },
      ],
    }],
  },

  { path: '*', element: <Navigate to={ROUTES.LANDING} replace /> },
]);

export default router;
