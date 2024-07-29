import { FormEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import axios from "../../api/axios";
import { useNotify } from "../../hooks";
import { setAccessToken } from "../../store/slices/accessTokenSlice";
import { setUser } from "../../store/slices/userSlice";
import style from "./Login.module.css";

// TODO: Solve problem with persists as it is undefined instead boolean
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

      const res = await axios.post(
        `/auth/login`,
        {
          email: email,
          password: password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      dispatch(setUser({ ...currentUser, ...res.data?.data?.user }));
      dispatch(setAccessToken(res.data?.data?.accessToken));
      notify("success", res.data.message);

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
