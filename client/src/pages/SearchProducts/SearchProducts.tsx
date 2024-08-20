import { BannerOne, CategoriesList, NewProductsList } from "../../components";
import ProductsList from "./components/ProductsList";

const CategoryProducts = () => {
  return (
    <section className="flex flex-col gap-8">
      {/* Top */}

      <div className="flex gap-4">
        {/* Left Side */}
        <div className="hidden lg:flex w-60 flex-col gap-5">
          <CategoriesList />

          <NewProductsList />
        </div>

        {/* Right Side */}
        <div className="flex-1 flex flex-col gap-6">
          <ProductsList />
        </div>
      </div>

      {/* Bottom */}

      {/* Banner One */}
      <BannerOne />
    </section>
  );
};

export default CategoryProducts;
