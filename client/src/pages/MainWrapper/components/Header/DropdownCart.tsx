import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { StoreState } from "client/src/store/store";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const DropdownCart = () => {
  const cartProducts = useSelector((state: StoreState) => state.cartProducts);

  return (
    <Link
      className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary"
      to={`/cart`}
    >
      <FontAwesomeIcon icon={faCartShopping} />
      {cartProducts && cartProducts.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-main text-white text-xs font-semibold">
          {cartProducts.length}
        </span>
      )}
    </Link>
  );
};

export default DropdownCart;
