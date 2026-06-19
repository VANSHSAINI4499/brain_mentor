import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AdminLayout } from './components/layout/AdminLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { RequireAuth } from './components/auth/RequireAuth';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import CreateForm from './pages/admin/CreateForm';
import FormDetail from './pages/admin/FormDetail';

import FeedbackPage from './pages/public/FeedbackPage';
import ThankYou from './pages/public/ThankYou';
import NotFound from './pages/public/NotFound';

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
    element: <Login />
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
        element: <Dashboard />
      },
      {
        path: 'create',
        element: <CreateForm />
      },
      {
        path: 'forms/:id',
        element: <FormDetail />
      }
    ]
  },
  {
    path: '/form',
    element: <PublicLayout />,
    children: [
      {
        path: ':formId',
        element: <FeedbackPage />
      },
      {
        path: ':formId/thank-you',
        element: <ThankYou />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);
