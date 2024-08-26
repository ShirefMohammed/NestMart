import { useEffect } from "react";
import { useSelector } from "react-redux";

import { axiosPrivate } from "../api/axios";
import { StoreState } from "../store/store";
import { useLogout, useRefreshToken } from "./";
import { httpStatusText } from "../utils/httpStatusText";

const useAxiosPrivate = () => {
  const accessToken = useSelector((state: StoreState) => state.accessToken);

  const refresh = useRefreshToken();
  const logout = useLogout();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (
          error?.response?.status === 401 &&
          error?.response?.data?.status === httpStatusText.AccessTokenExpiredError &&
          !prevRequest?.sent
        ) {
          try {
            prevRequest.sent = true;
            const newAccessToken = await refresh();
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest);
          } catch (refreshError) {
            if (
              refreshError?.response?.status === 401 &&
              refreshError?.response?.data?.status === httpStatusText.RefreshTokenExpiredError
            ) {
              logout();
            }
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken]);

  return axiosPrivate;
};

export default useAxiosPrivate;
