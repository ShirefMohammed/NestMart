import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

import { GetCartProductsResponse, GetNotificationsResponse } from "@shared/types/apiTypes";
import { MessageNotification, OrderNotification } from "@shared/types/entitiesTypes";

import { FirstReqLoadingMsg } from "../";
import { cartAPI } from "../../api/cartAPI";
import { notificationsAPI } from "../../api/notificationsAPI";
import NestMartLogo from "../../assets/NestMartLogo.png";
import { useAxiosPrivate, useRefreshToken } from "../../hooks";
import { setCart } from "../../store/slices/cartSlice";
import { pushNotification, setNotifications } from "../../store/slices/notificationsSlice";
import { StoreState } from "../../store/store";
import style from "./PersistLogin.module.css";

const PersistLogin = ({ socket }) => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);
  const accessToken = useSelector((state: StoreState) => state.accessToken);
  const [refreshLoad, setRefreshLoad] = useState<boolean>(true);
  /* This is important as PersistLogin will not unmount so here req and res interceptors will added globally */
  useAxiosPrivate();
  const refresh = useRefreshToken();
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

  // Fetch currentUser cart
  useEffect(() => {
    const fetchCartProduct = async () => {
      try {
        if (!accessToken) return;
        const res = await cartAPI.getCartProducts();
        const data: GetCartProductsResponse = res.data.data;
        dispatch(setCart(data.products));
      } catch (err) {
        console.log(err);
      }
    };

    fetchCartProduct();
  }, [accessToken]);

  // Fetch currentUser notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!accessToken) return;
        const res = await notificationsAPI.getNotifications(1, 10);
        const data: GetNotificationsResponse = res.data.data;
        dispatch(setNotifications(data.notifications));
      } catch (err) {
        console.log(err);
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

  // Receive notification event
  useEffect(() => {
    socket.on("receiveNotification", (notification: MessageNotification | OrderNotification) => {
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
        ) : // If refresh is loading to fetch currentUser and accessToken by refresh jwt
        refreshLoad ? (
          <div className={style.loading_container}>
            <FirstReqLoadingMsg /> {/* Server First Request Loading Message */}
            <img src={NestMartLogo} alt="NestMart Logo" />
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
