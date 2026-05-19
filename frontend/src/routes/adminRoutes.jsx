import DashboardPage from '../pages/admin/DashboardPage/DashboardPage';
import MovieManagePage from '../pages/admin/MovieManagePage/MovieManagePage';
import CinemaManagePage from '../pages/admin/CinemaManagePage/CinemaManagePage';
import RoomManagePage from '../pages/admin/RoomManagePage/RoomManagePage';
import ShowtimeManagePage from '../pages/admin/ShowtimeManagePage/ShowtimeManagePage';
import OrderManagePage from '../pages/admin/OrderManagePage/OrderManagePage';
import UserManagePage from '../pages/admin/UserManagePage/UserManagePage';
import BannerManagePage from '../pages/admin/BannerManagePage/BannerManagePage';
import EventManagePage from '../pages/admin/EventManagePage/EventManagePage';
import ComboManagePage from '../pages/admin/ComboManagePage/ComboManagePage';
import PromotionManagePage from '../pages/admin/PromotionManagePage/PromotionManagePage';
import PricingManagePage from '../pages/admin/PricingManagePage/PricingManagePage';

const adminRoutes = [
  { index: true, element: <DashboardPage /> },
  { path: 'phim', element: <MovieManagePage /> },
  { path: 'rap', element: <CinemaManagePage /> },
  { path: 'phong-chieu', element: <RoomManagePage /> },
  { path: 'lich-chieu', element: <ShowtimeManagePage /> },
  { path: 'gia-ve', element: <PricingManagePage /> },
  { path: 'don-hang', element: <OrderManagePage /> },
  { path: 'nguoi-dung', element: <UserManagePage /> },
  { path: 'banner', element: <BannerManagePage /> },
  { path: 'su-kien', element: <EventManagePage /> },
  { path: 'combo', element: <ComboManagePage /> },
  { path: 'ma-giam-gia', element: <PromotionManagePage /> },
];

export default adminRoutes;
