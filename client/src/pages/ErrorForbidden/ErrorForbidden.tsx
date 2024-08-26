import style from "./ErrorForbidden.module.css";

const ErrorForbidden = () => {
  return (
    <section className={style.forbidden}>
      <div>
        <h2>Forbidden</h2>
        <p>You do not have access to the this resource.</p>
      </div>
    </section>
  );
};

export default ErrorForbidden;
