import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

/**
 * ProtectedRoute — bảo vệ route cần đăng nhập + đúng role.
 * @param {string} requiredRole - 'admin' | 'customer' | null
 *   - 'admin'    : Chỉ admin truy cập, user khác → '/'
 *   - 'customer' : Chỉ khách hàng truy cập, admin → '/admin'
 *   - null       : Chỉ cần đăng nhập, không quan tâm role
 */
const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Chưa đăng nhập → về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // Sai role → điều hướng phù hợp
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') {
      // Admin lạc sang trang khách hàng → đẩy về dashboard admin
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
