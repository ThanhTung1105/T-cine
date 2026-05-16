import { createBrowserRouter } from 'react-router-dom';

// Layouts
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/features/auth/ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Route configs
import customerRoutes from './customerRoutes';
import adminRoutes from './adminRoutes';

const router = createBrowserRouter([
  // === Routes khách hàng ===
  {
    path: '/',
    element: <CustomerLayout />,
    children: customerRoutes,
  },

  // === Routes xác thực ===
  {
    path: '/dang-nhap',
    element: <LoginPage />,
  },
  {
    path: '/dang-ky',
    element: <RegisterPage />,
  },

  // === Routes quản trị (cần đăng nhập + role admin) ===
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: adminRoutes,
      },
    ],
  },
]);

export default router;
