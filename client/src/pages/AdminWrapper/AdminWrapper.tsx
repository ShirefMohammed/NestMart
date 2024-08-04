import { Outlet } from "react-router-dom";

import style from "./AdminWrapper.module.css";

const AdminWrapper = () => {
  return (
    <div className={style.main_wrapper}>
      {/* <Sidebar /> */} Sidebar
      {/* <Header /> */} Header
      <Outlet />
    </div>
  );
};

export default AdminWrapper;
