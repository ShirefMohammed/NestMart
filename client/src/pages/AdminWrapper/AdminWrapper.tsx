import { Outlet } from "react-router-dom";

import DefaultLayout from "./components/Layout/DefaultLayout";

const AdminWrapper = () => {
  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
};

export default AdminWrapper;
