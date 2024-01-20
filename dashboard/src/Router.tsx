import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import { NewNotificationPage } from './pages/NewNotificationPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/new-notification',
    element: <NewNotificationPage />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
