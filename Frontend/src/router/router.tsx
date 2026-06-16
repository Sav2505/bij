import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import LoadingScreen from '../components/ui/LoadingScreen';

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const HotelsListPage = lazy(() => import('../features/hotels/HotelsListPage'));
const HotelDetailsPage = lazy(() => import('../features/hotels/HotelDetailsPage'));
const AdminPanel = lazy(() => import('../features/admin/AdminPanel'));
const UsersPage = lazy(() => import('../features/admin/UsersPage'));
const ImportPage = lazy(() => import('../features/admin/ImportPage'));

const wrap = (element: JSX.Element) => <Suspense fallback={<LoadingScreen />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: wrap(<LoginPage />),
  },
  {
    path: '/',
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: wrap(<DashboardPage />) },
      { path: 'hotels', element: wrap(<HotelsListPage />) },
      { path: 'hotels/:id', element: wrap(<HotelDetailsPage />) },
      {
        path: 'admin',
        element: <AdminRoute>{wrap(<AdminPanel />)}</AdminRoute>,
        children: [
          { index: true, element: <Navigate to="/admin/users" replace /> },
          { path: 'users', element: wrap(<UsersPage />) },
          { path: 'import', element: wrap(<ImportPage />) },
          { path: '*', element: <Navigate to="/admin/users" replace /> },
        ],
      },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
