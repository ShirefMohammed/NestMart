import { StoreState } from "client/src/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

import { FirstReqLoadingMsg } from "../";
import NestMartLogo from "../../assets/NestMartLogo.png";
import { useAxiosPrivate, useHandleErrors, useRefreshToken } from "../../hooks";
import { pushNotification, setNotifications } from "../../store/slices/notificationsSlice";
import style from "./PersistLogin.module.css";

// TODO: Handle notifications type and socket in PersistLogin
const PersistLogin = ({ socket }) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const accessToken = useSelector((state: StoreState) => state.accessToken);

  const [refreshLoad, setRefreshLoad] = useState(true);

  const refresh = useRefreshToken();
  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();

  // Using refresh api to fetch currentUser data
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        if (currentUser?.persist && !accessToken) {
          await refresh();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRefreshLoad(false);
      }
    };

    verifyRefreshToken();
  }, []);

  // Fetch currentUser notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!accessToken) return;
        const res = await axiosPrivate.get(`/notifications`);
        dispatch(setNotifications(res.data.data));
      } catch (err) {
        handleErrors(err);
      }
    };

    fetchNotifications();
  }, [accessToken]);

  /* Sockets */

  // Current app socket Joins to userId room
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit("setup", currentUser?._id);
    }
  }, [currentUser]);

  // TODO: Receive notification event
  useEffect(() => {
    socket.on("receiveNotification", (notification) => {
      dispatch(pushNotification(notification));
    });

    return () => {
      socket.off("receiveNotification");
    };
  }, []);

  return (
    <>
      {
        // If no need to remember currentUser
        !currentUser?.persist ? (
          <Outlet />
        ) : // If refresh is loading to fetch accessToken by jwt
        refreshLoad ? (
          <div className={style.loading_container}>
            {/* Server First Request Loading Message */}
            <FirstReqLoadingMsg />
            <img src={NestMartLogo} alt="Logo" />
            <div className={style.creator}>
              <span>Created by</span>
              <Link to="https://shiref-mohammed.onrender.com/">Shiref Mohammed</Link>
            </div>
          </div>
        ) : (
          // If refresh finished loading
          <Outlet />
        )
      }
    </>
  );
};

export default PersistLogin;
