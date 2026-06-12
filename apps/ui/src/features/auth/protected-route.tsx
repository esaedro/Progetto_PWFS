import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: number;
  email: string;
  role: string; }

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; 
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const userRole = decoded.role;

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/home" replace />; 
    }

    return <>{children}</>;
  } catch (error) {
    localStorage.removeItem('access_token');
    return <Navigate to="/login" replace />;
  }
}