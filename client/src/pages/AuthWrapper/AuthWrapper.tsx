import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

import { useLogout } from "../../hooks";
import style from "./AuthWrapper.module.css";

const AuthWrapper = () => {
  const accessToken = useSelector((state: any) => state.accessToken);

  const navigate = useNavigate();
  const logout = useLogout();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <>
      {!accessToken ? (
        <Outlet />
      ) : (
        <section className={style.not_available_page}>
          <div>
            <h2>Not available page</h2>

            <p>You have already authenticated, you can logout to reauthenticate.</p>

            <div className={style.buttons}>
              <button onClick={goBack}>Go Back</button>
              <button onClick={goHome}>Go Home</button>
              <button onClick={logout}>Log Out</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AuthWrapper;
