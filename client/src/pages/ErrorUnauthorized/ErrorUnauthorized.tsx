import style from "./ErrorUnauthorized.module.css";

const ErrorUnauthorized = () => {
  return (
    <section className={style.unauthorized}>
      <div>
        <h2>Unauthorized</h2>
        <p>You do not have access to the this page.</p>
      </div>
    </section>
  );
};

export default ErrorUnauthorized;
