import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import ErrorPage from "../pages/error-page";
import DashboardView from "../pages/dashboard/DashboardView";
import LoginView from "../pages/auth/Login";
import ProfileView from "../pages/myProfile/Index";
import AuthLayout from "../layouts/AuthLayout";
import { useToken } from "../hooks/token";

import ListCustomersView from "../pages/customers/ListCustomersView";
import DetailCustomersView from "../pages/customers/DetailCustomersView";
import EditProfileView from "../pages/myProfile/EditProfileView";
import ListCategoryView from "../pages/categories/ListCategoryView";
import CategoryFormView from "../pages/categories/CategoryFormView";
import ProductFormView from "../pages/products/ProductFormView";
import ProductListView from "../pages/products/ListProductView";
import DetailProductView from "../pages/products/DetailProductView";
import ListSubCategoryView from "../pages/categories/subCategory/ListCategoryView";
import SubCategoryFormView from "../pages/categories/subCategory/SubCategoryFormView";
import ListUploadView from "../pages/uploads/ListUploadView";
import ListUploadHistoryView from "../pages/products/upload/ListUploadHistoryView";
import FormAdminView from "../pages/admins/FormAdminView";
import ListAdminView from "../pages/admins/ListAdminView";
import SettingsView from "../pages/settings/Index";
import ListProductPromotionView from "../pages/promotion/ListPromotionProductView";
import ListOrderView from "../pages/orders/ListOrderView";
import DetailOrderView from "../pages/orders/DetailOrderView";
import ListTransactionView from "../pages/transactions/ListTransactionView";

const getProtectedRouters = (role: string) => {
  const mainRouters: { path: string; element: JSX.Element }[] = [];

  const adminRouter = [
    ...[
      {
        path: "/",
        element: <DashboardView />,
      },
      {
        path: "/products",
        element: <ProductListView />,
      },
      {
        path: "/products/create",
        element: <ProductFormView />,
      },
      {
        path: "/products/edit/:productId",
        element: <ProductFormView />,
      },
      {
        path: "/products/detail/:productId",
        element: <DetailProductView />,
      },
      {
        path: "/products/uploads/histories",
        element: <ListUploadHistoryView />,
      },
      {
        path: "/promotions",
        element: <ListProductPromotionView />,
      },
      {
        path: "/categories",
        element: <ListCategoryView />,
      },
      {
        path: "/categories/create",
        element: <CategoryFormView />,
      },
      {
        path: "/categories/edit/:categoryId",
        element: <CategoryFormView />,
      },
      {
        path: "/uploads",
        element: <ListUploadView />,
      },
      {
        path: "/categories/subcategories/:categoryReference",
        element: <ListSubCategoryView />,
      },
      {
        path: "/categories/subcategories/:categoryReference/create",
        element: <SubCategoryFormView />,
      },
      {
        path: "/categories/subcategories/:categoryId/edit/:categoryReference",
        element: <SubCategoryFormView />,
      },
      {
        path: "/customers",
        element: <ListCustomersView />,
      },
      {
        path: "/customers/detail/:customerId",
        element: <DetailCustomersView />,
      },
      {
        path: "/orders",
        element: <ListOrderView />,
      },
      {
        path: "/orders/detail/:orderId",
        element: <DetailOrderView />,
      },
      {
        path: "/transactions",
        element: <ListTransactionView />,
      },
    ],
  ];

  const superAdminRouter = [
    ...adminRouter,
    {
      path: "/admins",
      element: <ListAdminView />,
    },
    {
      path: "/admins/create",
      element: <FormAdminView />,
    },
    {
      path: "/admins/detail/:id",
      element: <FormAdminView />,
    },
    {
      path: "/admins/edit/:id",
      element: <FormAdminView />,
    },
    {
      path: "/settings",
      element: <SettingsView />,
    },
  ];

  mainRouters.push({
    path: "/my-profile",
    element: <ProfileView />,
  });

  mainRouters.push({
    path: "/my-profile/edit/:userId",
    element: <EditProfileView />,
  });

  switch (role) {
    case "ADMIN":
      mainRouters.push(...adminRouter);
      break;
    case "SUPERADMIN":
      mainRouters.push(...superAdminRouter);
      break;
    default:
      break;
  }

  return mainRouters;
};

const authRouters: { path: string; element: JSX.Element }[] = [
  {
    path: "/",
    element: <LoginView />,
  },
  {
    path: "/login",
    element: <LoginView />,
  },
];

export default function AppRouters() {
  const { getDecodeJwtToken } = useToken();
  const user = getDecodeJwtToken();

  const routers: { path: string; element: JSX.Element }[] = [];

  if (user) {
    const protectedRouters = getProtectedRouters(
      user.userRole?.toLocaleUpperCase(),
    );
    routers.push(...protectedRouters);
  } else {
    routers.push(...authRouters);
  }

  const appRouters = createBrowserRouter([
    {
      path: "/",
      element: user ? <AppLayout /> : <AuthLayout />,
      errorElement: <ErrorPage />,
      children: routers,
    },
  ]);

  return <RouterProvider router={appRouters} />;
}
