import style from "./ErrorServerError.module.css";

const ErrorServerError = () => {
  return (
    <section className={style.server_error}>
      <div>
        <h2>Server Error</h2>
        <p>Some errors happened in server, try again after while</p>
      </div>
    </section>
  );
};

export default ErrorServerError;
