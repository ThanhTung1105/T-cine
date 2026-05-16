import DashboardPage from '../pages/admin/DashboardPage/DashboardPage';
import MovieManagePage from '../pages/admin/MovieManagePage/MovieManagePage';
import CinemaManagePage from '../pages/admin/CinemaManagePage/CinemaManagePage';
import RoomManagePage from '../pages/admin/RoomManagePage/RoomManagePage';
import ShowtimeManagePage from '../pages/admin/ShowtimeManagePage/ShowtimeManagePage';
import OrderManagePage from '../pages/admin/OrderManagePage/OrderManagePage';
import UserManagePage from '../pages/admin/UserManagePage/UserManagePage';
import RevenuePage from '../pages/admin/RevenuePage/RevenuePage';

const adminRoutes = [
  { index: true, element: <DashboardPage /> },
  { path: 'phim', element: <MovieManagePage /> },
  { path: 'rap', element: <CinemaManagePage /> },
  { path: 'phong-chieu', element: <RoomManagePage /> },
  { path: 'lich-chieu', element: <ShowtimeManagePage /> },
  { path: 'don-hang', element: <OrderManagePage /> },
  { path: 'nguoi-dung', element: <UserManagePage /> },
  { path: 'doanh-thu', element: <RevenuePage /> },
];

export default adminRoutes;
