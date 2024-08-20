import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { BannerOne } from "../../components";
import { StoreState } from "../../store/store";
import CartItems from "./components/CartItems";

const UserCart = () => {
  const cartProducts = useSelector((state: StoreState) => state.cartProducts);

  return (
    <section className="flex flex-col gap-8">
      <CartItems cartProducts={cartProducts} />

      <Link
        to="/orders"
        className="bg-main text-white text-sm rounded w-40 p-2 flex items-center justify-center gap-2"
      >
        Show your order
      </Link>

      <BannerOne />
    </section>
  );
};

export default UserCart;
