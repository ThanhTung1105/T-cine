import HomePage from '../pages/customer/HomePage/HomePage';
import MovieListPage from '../pages/customer/MovieListPage/MovieListPage';
import MovieDetailPage from '../pages/customer/MovieDetailPage/MovieDetailPage';
import BookingPage from '../pages/customer/BookingPage/BookingPage';
import PaymentPage from '../pages/customer/PaymentPage/PaymentPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage/OrderHistoryPage';
import ProfilePage from '../pages/customer/ProfilePage/ProfilePage';
import CinemaListPage from '../pages/customer/CinemaListPage/CinemaListPage';
import EventPage from '../pages/customer/EventPage/EventPage';
import EventDetailPage from '../pages/customer/EventDetailPage/EventDetailPage';
import SeatSelectionPage from '../pages/customer/BookingPage/SeatSelectionPage';
import ConcessionPage from '../pages/customer/BookingPage/ConcessionPage';
import MockPaymentPage from '../pages/customer/PaymentPage/MockPaymentPage';
import BookingSuccessPage from '../pages/customer/PaymentPage/BookingSuccessPage';
import CommunityPage from '../pages/customer/CommunityPage/CommunityPage';
import ProtectedRoute from '../components/features/auth/ProtectedRoute';

const customerRoutes = [
  // ===== Public routes (ai cũng xem được) =====
  { index: true, element: <HomePage /> },
  { path: 'phim-dang-chieu', element: <MovieListPage /> },
  { path: 'phim-sap-chieu', element: <MovieListPage /> },
  { path: 'phim/:id', element: <MovieDetailPage /> },
  { path: 'dat-ve/:id', element: <BookingPage /> },
  { path: 'rap', element: <CinemaListPage /> },
  { path: 'tin-moi-va-uu-dai', element: <EventPage /> },
  { path: 'tin-moi-va-uu-dai/:id', element: <EventDetailPage /> },
  { path: 'cong-dong', element: <CommunityPage /> },

  // ===== Customer-only routes (cần đăng nhập, admin không vào được) =====
  {
    element: <ProtectedRoute requiredRole="customer" />,
    children: [
      { path: 'chon-ghe/:showtimeId', element: <SeatSelectionPage /> },
      { path: 'bap-nuoc', element: <ConcessionPage /> },
      { path: 'thanh-toan', element: <PaymentPage /> },
      { path: 'mock-payment/:bookingId', element: <MockPaymentPage /> },
      { path: 'dat-ve-thanh-cong/:bookingId', element: <BookingSuccessPage /> },
      { path: 'lich-su-dat-ve', element: <OrderHistoryPage /> },
      { path: 'thanh-vien', element: <ProfilePage /> },
      // Alias cũ → vẫn vào ProfilePage để không vỡ link cũ
      { path: 'thong-tin-ca-nhan', element: <ProfilePage /> },
    ],
  },
];

export default customerRoutes;
