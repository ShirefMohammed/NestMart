import homeBanner1 from "../../../assets/banners/homeBanner1.png";
import homeBanner2 from "../../../assets/banners/homeBanner2.png";
import homeBanner3 from "../../../assets/banners/homeBanner3.png";

const HomeBanners = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
      <div
        style={{ backgroundImage: `url(${homeBanner1})` }}
        className="w-full h-45 p-5 bg-cover rounded-md"
      >
        <p className="max-w-45 text-xl font-bold">Everyday fresh & clean with our products</p>
      </div>

      <div
        style={{ backgroundImage: `url(${homeBanner2})` }}
        className="w-full h-45 p-5 bg-cover rounded-md"
      >
        <p className="max-w-45 text-xl font-bold">Make your breakfast healthy and easy</p>
      </div>

      <div
        style={{ backgroundImage: `url(${homeBanner3})` }}
        className="w-full h-45 p-5 bg-cover rounded-md"
      >
        <p className="max-w-45 text-xl font-bold">The best organic products online</p>
      </div>
    </div>
  );
};

export default HomeBanners;
