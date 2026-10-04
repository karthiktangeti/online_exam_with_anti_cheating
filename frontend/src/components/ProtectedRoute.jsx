import { Navigate } from 'react-router-dom'; import { useAuth } from '../context/AuthContext.jsx'; import { LoadingSpinner } from './UI.jsx';
export default function ProtectedRoute({ role, children }) { // role: 'student' | 'admin' (AdminRoute = role="admin")
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  return children;
}
