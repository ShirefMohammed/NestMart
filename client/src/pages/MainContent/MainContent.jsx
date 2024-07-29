import { Route, Routes } from "react-router-dom";

import { Home} from "../";
import { RequireAuth } from "../../components";
import { ROLES_LIST } from "../../utils/rolesList";
import style from "./MainContent.module.css";
// import Navbar from "./components/Navbar/Navbar";
// import Sidebar from "./components/Sidebar/Sidebar";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MainContent = ({ socket }) => {
  return (
    <div className={style.main_content}>
      {/* <Sidebar /> */}

      <section className={style.current_page}>
        {/* <Navbar /> */}

        <Routes>
          {/* Public Routes */}

          <Route path="/" element={<Home />} />
          {/* <Route path="/products/:productId" element={<Video socket={socket} />} /> */}
          {/* <Route path="/users/:userId" element={<Profile socket={socket} />} /> */}

          {/* Protected Routes only can be accessed by verified user */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            {/* <Route path="/products/:productId/update" element={<UpdateVideo />} /> */}
            {/* <Route path="/users/:userId/update" element={<UpdateProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/:tab" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} /> */}
          </Route>
        </Routes>
      </section>
    </div>
  );
};

export default MainContent;
