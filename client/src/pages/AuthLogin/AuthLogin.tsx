import { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import { LoginRequest, LoginResponse } from "@shared/types/apiTypes";

import { authAPI } from "../../api/authAPI";
import { useNotify } from "../../hooks";
import { setAccessToken } from "../../store/slices/accessTokenSlice";
import { setUser } from "../../store/slices/userSlice";
import style from "./AuthLogin.module.css";

const Login = () => {
  const currentUser = useSelector((state: any) => state.currentUser);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [loginLoad, setLoginLoad] = useState(false);

  const dispatch = useDispatch();
  const notify = useNotify();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Focus on email input
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  // Reset error msg
  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  // Handle persist
  const togglePersist = () => {
    dispatch(setUser({ ...currentUser, persist: !currentUser?.persist }));
  };

  useEffect(() => {
    localStorage.setItem("persist", currentUser?.persist);
  }, [currentUser?.persist]);

  // Login
  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoginLoad(true);

      const reqBody: LoginRequest = {
        email: email,
        password: password,
      };

      const res = await authAPI.login(reqBody);

      const resData: LoginResponse = res.data?.data;

      dispatch(setUser({ ...currentUser, ...resData?.user }));
      dispatch(setAccessToken(resData?.accessToken));
      notify("success", res.data?.message);

      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? setErrMsg(message) : setErrMsg("Login Process Failed");
      }

      if (errRef.current) errRef.current.focus();
    } finally {
      setLoginLoad(false);
    }
  };

  return (
    <section className={style.login}>
      <form onSubmit={login}>
        <h2>Login</h2>

        <div ref={errRef} aria-live="assertive">
          {errMsg && <p className={style.error_message}>{errMsg}</p>}
        </div>

        <input
          type="email"
          ref={emailRef}
          autoComplete="off"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        <div className={style.persistCheck}>
          <input
            type="checkbox"
            id="persist"
            onChange={togglePersist}
            checked={currentUser?.persist}
          />
          <label htmlFor="persist">Remember Me</label>
        </div>

        <button
          type="submit"
          disabled={loginLoad ? true : false}
          style={loginLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          <span>Login</span>
          {loginLoad && <MoonLoader color="#fff" size={15} />}
        </button>

        {/* Controllers */}
        <nav className={style.controllers}>
          <Link to={"/auth/register"}>Register</Link>
          <Link to={"/auth/forgetPassword"}>Forget Password</Link>
        </nav>
      </form>
    </section>
  );
};

export default Login;
