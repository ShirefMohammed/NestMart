import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";

import { PersistLogin, RequireAuth, ToastContainerWithProps } from "./components";
import {
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

              <Route path="cart" element={"<Cart />"} />
              <Route path="orders" element={"<Orders />"} />

              <Route path="categories:categoryTitle" element={"<categoryProducts />"} />
              <Route path="products:productId" element={"<Product />"} />

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
                <Route index element={"<Dashboard />"} />

                <Route path="dashboard" element={"<Dashboard />"} />

                <Route path="users" element={"<Users />"} />

                <Route path="orders" element={"<Orders />"} />

                <Route path="categories" element={"<Categories />"} />

                <Route path="products" element={"<Products />"} />
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
