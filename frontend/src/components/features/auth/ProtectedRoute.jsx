import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

/**
 * ProtectedRoute — bảo vệ route cần đăng nhập
 * @param {string} requiredRole - 'admin' | 'customer' | null
 */
const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Chưa đăng nhập → về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Kiểm tra quyền (nếu yêu cầu)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
