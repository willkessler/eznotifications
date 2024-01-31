import React from 'react';
import { createBrowserRouter,  Navigate, Route, RouterProvider, Switch, Redirect } from 'react-router-dom';

import NotificationsProviderWrapper from './lib/NotificationsProviderWrapper';
import { HomePage } from './pages/Home.page';
import  LoginPage from './pages/Login.page';
import AuthService from './services/Auth.service';

const router = createBrowserRouter([
 {
    path: '/',
    element: AuthService.isAuthenticated() ? 
      <Navigate to="/dashboard" replace /> : 
      <Navigate to="/login" replace />,
  },
  {
      path: '/dashboard',
      element: (
          <NotificationsProviderWrapper>
              <HomePage />
          </NotificationsProviderWrapper>
      ),
  },
  {
      path: '/login',
      element: (
          <LoginPage />
      ),
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
