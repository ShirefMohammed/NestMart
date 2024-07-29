import { useDispatch, useSelector } from "react-redux";

import axios from "../api/axios";
import { setAccessToken } from "../store/slices/accessTokenSlice";
import { setUser } from "../store/slices/userSlice";
import { StoreState } from "../store/store";

const useRefreshToken = () => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);

  const dispatch = useDispatch();

  const refresh = async () => {
    const res = await axios.get("/auth/refresh", { withCredentials: true });

    dispatch(setUser({ ...currentUser, ...res.data?.data?.user }));
    dispatch(setAccessToken(res.data?.data?.accessToken));

    return res.data?.data?.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
