import { faCheck, faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";

import { RegisterRequest } from "@shared/types/apiTypes";

import { authAPI } from "../../api/authAPI";
import { RgxList } from "../../utils/RgxList";
import style from "./AuthRegister.module.css";

const Register = () => {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLInputElement | null>(null);
  const successRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [EmailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [validConfirmPassword, setValidConfirmPassword] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [registerLoad, setRegisterLoad] = useState(false);

  // Focus on name input
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  // Reset Error msg
  useEffect(() => {
    setErrMsg("");
  }, [name, email, password, confirmPassword]);

  // Check valid inputs
  useEffect(() => {
    setValidName(RgxList.NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidEmail(RgxList.EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(RgxList.PASS_REGEX.test(password));
    setValidConfirmPassword(confirmPassword === password);
  }, [password, confirmPassword]);

  // Register
  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // If buttons enabled with JS hack
      if (
        !RgxList.NAME_REGEX.test(name) ||
        !RgxList.EMAIL_REGEX.test(email) ||
        !RgxList.PASS_REGEX.test(password)
      ) {
        setErrMsg("Invalid Entry");
        if (errRef.current) errRef.current.focus();
        return;
      }

      if (password !== confirmPassword) {
        setErrMsg("Confirm password must match password");
        if (errRef.current) errRef.current.focus();
        return;
      }

      setRegisterLoad(true);

      // Create newUser and send request to the server
      const reqBody: RegisterRequest = {
        name: name,
        email: email,
        password: password,
      };

      const res = await authAPI.register(reqBody);

      // Empty states
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Set success message
      setSuccessMsg(res.data?.message);
      if (successRef.current) successRef.current.focus();
    } catch (err) {
      // If no server response
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else {
        // If error message
        const message = err.response?.data?.message;
        message ? setErrMsg(message) : setErrMsg("Register Process Failed");
      }

      if (errRef.current) errRef.current.focus();
    } finally {
      setRegisterLoad(false);
    }
  };

  return (
    <section className={style.register}>
      <form onSubmit={register}>
        {/* Title */}
        <h2>Register</h2>

        {/* Error Message */}
        <div ref={errRef} aria-live="assertive">
          {errMsg && <p className={style.error_message}>{errMsg}</p>}
        </div>

        {/* Success Message */}
        <div ref={successRef} aria-live="assertive">
          {successMsg && <p className={style.success_message}>{successMsg}</p>}
        </div>

        {/* Name */}
        <div>
          <span className={style.check_mark}>
            {name === "" ? (
              ""
            ) : validName ? (
              <FontAwesomeIcon icon={faCheck} className={style.valid} />
            ) : (
              <FontAwesomeIcon icon={faTimes} className={style.invalid} />
            )}
          </span>
          <input
            type="text"
            autoComplete="off"
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
            aria-invalid={!validName ? "true" : "false"}
            aria-describedby="nameNote"
            onFocus={() => setNameFocus(true)}
            onBlur={() => setNameFocus(false)}
            ref={nameRef}
          />
          {nameFocus && name && !validName ? (
            <p id="nameNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              4 to 24 characters.
              <br />
              Must begin with a letter.
              <br />
              Letters, numbers, underscores, hyphens allowed.
              <br />
              No spaces.
            </p>
          ) : (
            ""
          )}
        </div>

        {/* Email */}
        <div>
          <span className={style.check_mark}>
            {email === "" ? (
              ""
            ) : validEmail ? (
              <FontAwesomeIcon icon={faCheck} className={style.valid} />
            ) : (
              <FontAwesomeIcon icon={faTimes} className={style.invalid} />
            )}
          </span>
          <input
            type="email"
            autoComplete="off"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            aria-invalid={!validEmail ? "true" : "false"}
            aria-describedby="emailNote"
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
          />
          {EmailFocus && email && !validEmail ? (
            <p id="emailNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Enter valid email, we will send verification token to your email.
            </p>
          ) : (
            ""
          )}
        </div>

        {/* Password */}
        <div>
          <span className={style.check_mark}>
            {password === "" ? (
              ""
            ) : validPassword ? (
              <FontAwesomeIcon icon={faCheck} className={style.valid} />
            ) : (
              <FontAwesomeIcon icon={faTimes} className={style.invalid} />
            )}
          </span>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            aria-invalid={validPassword ? "false" : "true"}
            aria-describedby="passwordNote"
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
          />
          {passwordFocus && !validPassword ? (
            <p id="passwordNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              8 to 24 characters.
              <br />
              Must include uppercase and lowercase letters , a number and a special character.
              <br />
              Allowed special characters:
              <span aria-label="exclamation mark"> ! </span>
              <span aria-label="at symbol">@ </span>
              <span aria-label="hashtag"># </span>
              <span aria-label="dollar sign">$ </span>
              <span aria-label="percent">% </span>
            </p>
          ) : (
            ""
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <span className={style.check_mark}>
            {confirmPassword === "" ? (
              ""
            ) : validConfirmPassword ? (
              <FontAwesomeIcon icon={faCheck} className={style.valid} />
            ) : (
              <FontAwesomeIcon icon={faTimes} className={style.invalid} />
            )}
          </span>
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            required
            aria-invalid={validConfirmPassword ? "false" : "true"}
            aria-describedby="confirmPasswordNote"
            onFocus={() => setConfirmPasswordFocus(true)}
            onBlur={() => setConfirmPasswordFocus(false)}
          />
          {confirmPasswordFocus && !validConfirmPassword ? (
            <p id="confirmPasswordNote" className={style.instructions}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match password field.
            </p>
          ) : (
            ""
          )}
        </div>

        {/* Submit Btn */}
        <button
          type="submit"
          disabled={registerLoad ? true : false}
          style={registerLoad ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          <span>Register</span>
          {registerLoad && <MoonLoader color="#fff" size={15} />}
        </button>

        {/* Controllers */}
        <nav className={style.controllers}>
          <Link to={"/auth/login"}>Login</Link>
          <Link to={"/auth/forgetPassword"}>Forget Password</Link>
        </nav>
      </form>
    </section>
  );
};

export default Register;
