import { Outlet } from "react-router-dom";

import style from "./MainWrapper.module.css";

const MainWrapper = () => {
  return (
    <div className={style.main_wrapper}>
      {/* <Header /> */} Header
      <Outlet />
      {/* <Footer /> */} Footer
    </div>
  );
};

export default MainWrapper;
