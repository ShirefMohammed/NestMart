import { useDispatch, useSelector } from "react-redux";

import { RefreshResponse } from "@shared/types/apiTypes";

import axios from "../api/axios";
import { setAccessToken } from "../store/slices/accessTokenSlice";
import { setUser } from "../store/slices/userSlice";
import { StoreState } from "../store/store";

const useRefreshToken = () => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);

  const dispatch = useDispatch();

  const refresh = async () => {
    const res = await axios.get("/auth/refresh", { withCredentials: true });

    const resData: RefreshResponse = res.data?.data;

    dispatch(setUser({ ...currentUser, ...resData?.user }));
    dispatch(setAccessToken(resData?.accessToken));

    return resData?.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
