import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";

import { PersistLogin, RequireAuth, ToastContainerWithProps } from "./components";
import {
  AdminCategories,
  AdminDashboard,
  AdminOrders,
  AdminProducts,
  AdminUsers,
  AdminWrapper,
  AuthForgetPassword,
  AuthLogin,
  AuthRegister,
  AuthWrapper,
  CategoryProducts,
  Chat,
  ErrorForbidden,
  ErrorNoResourceFound,
  ErrorNoServerResponse,
  ErrorNoTFoundPage,
  ErrorServerError,
  ErrorUnauthorized,
  Home,
  MainWrapper,
  Product,
  SearchProduct,
  UserCart,
  UserNotifications,
  UserOrders,
  UserProfile,
  UserSettings,
} from "./pages";
import { ROLES_LIST } from "./utils/rolesList";

// Initialize Socket Server
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const socket = io(SERVER_URL);

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PersistLogin socket={socket} />}>
            {/* Auth Routes - Public Routes */}
            <Route path="/auth" element={<AuthWrapper />}>
              <Route index element={<Navigate to="login" />} />
              <Route path="login" element={<AuthLogin />} />
              <Route path="register" element={<AuthRegister />} />
              <Route path="forgetPassword" element={<AuthForgetPassword />} />
            </Route>

            <Route path="/*" element={<MainWrapper />}>
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />

              <Route path="categories/:categoryId/products" element={<CategoryProducts />} />
              <Route path="products/search" element={<SearchProduct />} />
              <Route path="products/:productId" element={<Product />} />

              {/* Protected Routes */}
              <Route
                element={
                  <RequireAuth
                    allowedRoles={[ROLES_LIST.User, ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]}
                  />
                }
              >
                <Route path="cart" element={<UserCart socket={socket} />} />
                <Route path="orders" element={<UserOrders />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="users/:userId/profile" element={<UserProfile />} />
                <Route path="settings" element={<UserSettings />} />
              </Route>

              {/* Error Handler Routes - Public Routes */}
              <Route path="noServerResponse" element={<ErrorNoServerResponse />} />
              <Route path="serverError" element={<ErrorServerError />} />
              <Route path="unauthorized" element={<ErrorUnauthorized />} />
              <Route path="forbidden" element={<ErrorForbidden />} />
              <Route path="noResourceFound" element={<ErrorNoResourceFound />} />
              <Route path="*" element={<ErrorNoTFoundPage />} />
            </Route>

            {/* Chat Routes - Protected Routes */}
            <Route
              path="/chat"
              element={
                <RequireAuth
                  allowedRoles={[ROLES_LIST.User, ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]}
                />
              }
            >
              <Route index element={<Chat socket={socket} />} />
              <Route path=":chatId" element={<Chat socket={socket} />} />
            </Route>

            {/* Admin Dashboard - Protected Routes */}
            <Route
              path="/admin"
              element={<RequireAuth allowedRoles={[ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]} />}
            >
              <Route element={<AdminWrapper />}>
                <Route index element={<AdminDashboard />} />

                <Route path="dashboard" element={<AdminDashboard />} />

                <Route path="users" element={<AdminUsers socket={socket} />} />

                <Route path="orders" element={<AdminOrders />} />

                <Route path="categories" element={<AdminCategories />} />

                <Route path="products" element={<AdminProducts />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Toast Container with its props */}
      <ToastContainerWithProps />
    </>
  );
}

export default App;
