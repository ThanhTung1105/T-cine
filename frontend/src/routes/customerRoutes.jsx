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
import CommunityPage from '../pages/customer/CommunityPage/CommunityPage';

const customerRoutes = [
  { index: true, element: <HomePage /> },
  { path: 'phim-dang-chieu', element: <MovieListPage /> },
  { path: 'phim-sap-chieu', element: <MovieListPage /> },
  { path: 'phim/:id', element: <MovieDetailPage /> },
  { path: 'dat-ve/:showtimeId', element: <BookingPage /> },
  { path: 'chon-ghe/:cinemaId/:timeId', element: <SeatSelectionPage /> },
  { path: 'bap-nuoc/:cinemaId/:timeId', element: <ConcessionPage /> },
  { path: 'thanh-toan', element: <PaymentPage /> },
  { path: 'mock-payment', element: <MockPaymentPage /> },
  { path: 'lich-su-dat-ve', element: <OrderHistoryPage /> },
  { path: 'thong-tin-ca-nhan', element: <ProfilePage /> },
  { path: 'rap', element: <CinemaListPage /> },
  { path: 'tin-moi-va-uu-dai', element: <EventPage /> },
  { path: 'tin-moi-va-uu-dai/:id', element: <EventDetailPage /> },
  { path: 'cong-dong', element: <CommunityPage /> },
];

export default customerRoutes;
