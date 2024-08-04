import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";

import { PersistLogin, RequireAuth, ToastContainerWithProps } from "./components";
import {
  AdminWrapper,
  AuthWrapper,
  Chat,
  ForgetPassword,
  Login,
  MainWrapper,
  NoResourceFound,
  NoServerResponse,
  NoTFoundPage,
  Register,
  ServerError,
  Unauthorized,
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
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="forgetPassword" element={<ForgetPassword />} />
            </Route>

            {/* Auth Routes - Public */}
            <Route path="/*" element={<MainWrapper />}>
              <Route path="home" element={"<Home />"} />
              <Route path="about" element={"<About />"} />
              <Route path="contact" element={"<Contact />"} />

              <Route path="cart" element={"<Cart />"} />
              <Route path="orders" element={"<Orders />"} />

              <Route path="categories:categoryTitle" element={"<categoryProducts />"} />
              <Route path="products:productId" element={"<Product />"} />

              <Route path="*" element={<NoTFoundPage />} />
            </Route>

            {/* Error Handler Routes - Public */}
            <Route path="/noServerResponse" element={<NoServerResponse />} />
            <Route path="/serverError" element={<ServerError />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/noResourceFound" element={<NoResourceFound />} />

            {/* Protected Routes */}
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

            <Route
              element={<RequireAuth allowedRoles={[ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]} />}
            >
              <Route path="/adminDashboard" element={<AdminWrapper />}>
                <Route index element={"<Dashboard />"} />

                <Route path="users" element={"<Users />"} />

                <Route path="orders" element={"<Orders />"} />

                <Route path="categories" element={"<Categories />"} />
                <Route path="categories/new" element={"<CreateCategory />"} />
                <Route path="categories/categoryId/update" element={"<updateCategory />"} />

                <Route path="products" element={"<Products />"} />
                <Route path="products/new" element={"<CreateProduct />"} />
                <Route path="products/productId/update" element={"<updateProduct />"} />

                <Route path="*" element={<NoTFoundPage />} />
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
