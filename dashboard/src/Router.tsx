import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotificationsProviderWrapper from './lib/NotificationsProviderWrapper';
import { HomePage } from './pages/Home.page';
import { NewNotificationPage } from './pages/NewNotificationPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
        <NotificationsProviderWrapper>
          <HomePage />
        </NotificationsProviderWrapper>
    ),
  },
  {
      path: '/new-notification',
      element: (
        <NotificationsProviderWrapper>
              <NewNotificationPage />
        </NotificationsProviderWrapper>
      ),
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
