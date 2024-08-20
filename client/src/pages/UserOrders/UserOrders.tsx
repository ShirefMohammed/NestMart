import { Link } from "react-router-dom";

import { BannerOne } from "../../components";
import Orders from "./components/Orders";

const UserOrders = () => {
  return (
    <section className="flex flex-col gap-8">
      <Orders />

      <Link
        to="/cart"
        className="bg-main text-white text-sm rounded w-40 p-2 flex items-center justify-center gap-2"
      >
        Back to cart
      </Link>

      <BannerOne />
    </section>
  );
};

export default UserOrders;
