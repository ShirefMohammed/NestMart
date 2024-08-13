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
  Chat,
  ErrorNoResourceFound,
  ErrorNoServerResponse,
  ErrorNoTFoundPage,
  ErrorServerError,
  ErrorUnauthorized,
  MainWrapper,
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
            {/* Auth Routes - Public */}
            <Route path="/auth" element={<AuthWrapper />}>
              <Route index element={<Navigate to="login" />} />
              <Route path="login" element={<AuthLogin />} />
              <Route path="register" element={<AuthRegister />} />
              <Route path="forgetPassword" element={<AuthForgetPassword />} />
            </Route>

            {/* Public Routes */}
            <Route path="/*" element={<MainWrapper />}>
              <Route path="home" element={"<Home />"} />
              <Route path="about" element={"<About />"} />
              <Route path="contact" element={"<Contact />"} />

              <Route path="user/:userId/profile" element={"<Profile />"} />
              <Route path="user/:userId/settings" element={"<Settings />"} />

              <Route path="user/:userId/cart" element={"<Cart />"} />
              <Route path="user/:userId/orders" element={"<Orders />"} />

              <Route path="categories/:categoryId/Products" element={"<categoryProducts />"} />
              <Route path="products/:productId" element={"<Product />"} />

              <Route path="*" element={<ErrorNoTFoundPage />} />
            </Route>

            {/* Error Handler Routes - Public */}
            <Route path="/noServerResponse" element={<ErrorNoServerResponse />} />
            <Route path="/serverError" element={<ErrorServerError />} />
            <Route path="/unauthorized" element={<ErrorUnauthorized />} />
            <Route path="/noResourceFound" element={<ErrorNoResourceFound />} />

            {/* Chat Routes - Protected Routes */}
            <Route
              element={
                <RequireAuth
                  allowedRoles={[ROLES_LIST.User, ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]}
                />
              }
            >
              <Route path="/chat" element={<Chat socket={socket} />} />
              <Route path="/chat/:chatId" element={<Chat socket={socket} />} />
            </Route>

            {/* AdminDashboard - Protected Routes */}
            <Route
              element={<RequireAuth allowedRoles={[ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]} />}
            >
              <Route path="/admin" element={<AdminWrapper />}>
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
