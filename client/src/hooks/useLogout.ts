import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import axios from "../api/axios";
import { setAccessToken } from "../store/slices/accessTokenSlice";
import { setUser } from "../store/slices/userSlice";
import { StoreState } from "../store/store";

const useLogout = () => {
  const currentUser = useSelector((state: StoreState) => state.currentUser);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      dispatch(setUser({ persist: currentUser?.persist }));
      dispatch(setAccessToken(""));

      await axios.get("/auth/logout", { withCredentials: true });
      navigate("/auth");
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
