import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { Loader } from './components/shared/Loader';

const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const CreateForm = lazy(() => import('./pages/admin/CreateForm'));
const FormDetail = lazy(() => import('./pages/admin/FormDetail'));

const FeedbackPage = lazy(() => import('./pages/public/FeedbackPage'));
const ThankYou = lazy(() => import('./pages/public/ThankYou'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<Loader fullScreen text="Loading..." />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/admin/login" replace />
  },
  {
    path: '/admin',
    element: <Navigate to="/admin/dashboard" replace />
  },
  {
    path: '/admin/login',
    element: withSuspense(Login)
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'dashboard',
        element: withSuspense(Dashboard)
      },
      {
        path: 'create',
        element: withSuspense(CreateForm)
      },
      {
        path: 'forms/:id',
        element: withSuspense(FormDetail)
      }
    ]
  },
  {
    path: '/form',
    element: <PublicLayout />,
    children: [
      {
        path: ':formId',
        element: withSuspense(FeedbackPage)
      },
      {
        path: ':formId/thank-you',
        element: withSuspense(ThankYou)
      }
    ]
  },
  {
    path: '*',
    element: withSuspense(NotFound)
  }
]);

