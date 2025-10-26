// Key functionality: App routing with auth guard and pages.
import { createBrowserRouter, Navigate } from "react-router";
import App from "@/App";
import PhonePage from "@/views/auth/phone";
import CodePage from "@/views/auth/code";
import OnboardingPage from "@/views/onboarding";
import NewRequestPage from "@/views/new-request";
import OrdersPage from "@/views/orders";
import OrderDetailPage from "@/views/orders/[id]";
import HomePage from "@/views/home";
import SuccessPage from "@/views/success";
import SubscriptionsPage from "@/views/subscriptions";
import AdminDashboardPage from "@/views/admin/dashboard/index";
import AdminUsersPage from "@/views/admin/users/index";
import NewUserPage from "@/views/admin/users/new";
import EditUserPage from "@/views/admin/users/[id]";
import AdminRoutesPage from "@/views/admin/routes/index";
import NewRoutePage from "@/views/admin/routes/new";
import EditRoutePage from "@/views/admin/routes/[id]";
import CompanyInfoPage from "@/views/admin/company/index";
import { RequireAuth, RequireOnboarding } from "@/routes/guards";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/new" replace /> },
      { path: "/auth/phone", element: <PhonePage /> },
      { path: "/auth/code", element: <CodePage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "/onboarding", element: <OnboardingPage /> },
          {
            element: <RequireOnboarding />,
            children: [
              { path: "/home", element: <HomePage /> },
              { path: "/new", element: <NewRequestPage /> },
              { path: "/orders", element: <OrdersPage /> },
              { path: "/orders/:id", element: <OrderDetailPage /> },
              { path: "/success/:orderId", element: <SuccessPage /> },
              { path: "/subscriptions", element: <SubscriptionsPage /> },
              { path: "/admin", element: <AdminDashboardPage /> },
              { path: "/admin/users", element: <AdminUsersPage /> },
              { path: "/admin/users/new", element: <NewUserPage /> },
              { path: "/admin/users/:id", element: <EditUserPage /> },
              { path: "/admin/routes", element: <AdminRoutesPage /> },
              { path: "/admin/routes/new", element: <NewRoutePage /> },
              { path: "/admin/routes/:id", element: <EditRoutePage /> },
              { path: "/admin/company", element: <CompanyInfoPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/new" replace /> },
    ],
  },
]);

export default router;
