import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import DefaultLayout from "./components/Layout/DefaultLayout";

const AdminWrapper = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  );
};

export default AdminWrapper;
