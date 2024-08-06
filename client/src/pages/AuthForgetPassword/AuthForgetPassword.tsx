import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import { ForgetPasswordRequest } from "@shared/types/apiTypes";

import { authAPI } from "../../api/authAPI";
import style from "./AuthForgetPassword.module.css";

const ForgetPassword = () => {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLInputElement | null>(null);
  const successRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [forgetPasswordLoad, setForgetPasswordLoad] = useState(false);

  // Focus on email input
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  // Reset error and success msg
  useEffect(() => {
    setErrMsg("");
    setSuccessMsg("");
  }, [email]);

  // Forget password
  const forgetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setForgetPasswordLoad(true);

      const reqBody: ForgetPasswordRequest = {
        email: email,
      };

      const res = await authAPI.forgetPassword(reqBody);

      setSuccessMsg(res.data?.message);
      if (successRef.current) successRef.current.focus();
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else {
        const message = err.response?.data?.message;
        message ? setErrMsg(message) : setErrMsg("Forget Password Process Failed");
      }

      if (errRef.current) errRef.current.focus();
    } finally {
      setForgetPasswordLoad(false);
    }
  };

  return (
    <section className={style.forget_password}>
      <form onSubmit={forgetPassword}>
        <h2>Forget Password</h2>

        <div ref={errRef} aria-live="assertive">
          {errMsg && <p className={style.error_message}>{errMsg}</p>}
        </div>

        <div ref={successRef} aria-live="assertive">
          {successMsg && <p className={style.success_message}>{successMsg}</p>}
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

        <button
          type="submit"
          disabled={forgetPasswordLoad ? true : false}
          style={forgetPasswordLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          <span>Submit</span>
          {forgetPasswordLoad && <MoonLoader color="#fff" size={15} />}
        </button>

        <nav className={style.controllers}>
          <Link to={"/auth/login"}>Login</Link>
          <Link to={"/auth/register"}>Register</Link>
        </nav>
      </form>
    </section>
  );
};

export default ForgetPassword;
