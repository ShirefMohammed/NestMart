import { BannerOne, CategoriesList, NewProductsList } from "../../components";
import AllCategoriesList from "./components/AllCategoriesList";
import BannerSlider from "./components/BannerSlider";
import HomeBanners from "./components/HomeBanners";
import LatestProducts from "./components/LatestProducts";

const Home = () => {
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
          <BannerSlider />

          <LatestProducts />

          <HomeBanners />
        </div>
      </div>

      {/* Bottom */}

      {/* All Categories List */}
      <AllCategoriesList />

      {/* Banner One */}
      <BannerOne />
    </section>
  );
};

export default Home;
