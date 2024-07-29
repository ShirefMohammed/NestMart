import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";

import { PersistLogin, RequireAuth, ToastContainerWithProps } from "./components";
import {
  AuthWrapper,
  ForgetPassword,
  Login,
  MainContent,
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
  console.log(useSelector((state) => state));

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PersistLogin socket={socket} />}>
            {/* Auth Routes - Public */}
            <Route path="/auth/" element={<AuthWrapper />}>
              <Route index element={<Navigate to="login" />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="forgetPassword" element={<ForgetPassword />} />
            </Route>

            {/* Error Handler Routes - Public */}
            <Route path="/noServerResponse" element={<NoServerResponse />} />
            <Route path="/serverError" element={<ServerError />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/noResourceFound" element={<NoResourceFound />} />
            <Route path="*" element={<NoTFoundPage />} />

            {/* Protected Routes - Private for admins */}
            <Route
              element={<RequireAuth allowedRoles={[ROLES_LIST.Admin, ROLES_LIST.SuperAdmin]} />}
            >
              {/* <Route path="/adminDashboard" element={<AdminDashboard />} />
              <Route path="/adminDashboard/:tab" element={<AdminDashboard />} /> */}
            </Route>

            <Route path="/*" element={<MainContent socket={socket} />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* Toast Container with its props */}
      <ToastContainerWithProps />
    </>
  );
}

export default App;
