import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const DropdownCart = () => {
  return (
    <Link
      className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary"
      to={`/cart`}
    >
      <FontAwesomeIcon icon={faCartShopping} />
    </Link>
  );
};

export default DropdownCart;
