import bannerOneImg1 from "../assets/banners/bannerOneImg1.png";
import bannerOneImg2 from "../assets/banners/bannerOneImg2.png";

const BannerOne = () => {
  return (
    <div
      className="relative flex justify-between items-center w-full px-6 py-10 md:px-8 md:py-12 rounded-lg bg-cover bg-center"
      style={{ backgroundImage: `url(${bannerOneImg1})` }}
    >
      <div>
        <h2 className="mb-5 font-bold text-3xl md:text-4xl max-w-80 md:max-w-115">
          Stay home & get your daily needs form our shop
        </h2>

        <p className="mb-8 font-medium text-lg text-heavyGray capitalize">
          Start your daily shopping with NestMart
        </p>

        <form
          className="relative w-fit"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <button
            type="submit"
            title="search"
            className="absolute inset-y-0 ltr:inset-r-0 flex items-center justify-center text-white bg-main rounded-full text-sm px-3 top-0 end-0"
          >
            Subscribe
          </button>
          <input
            type="text"
            id="sign-up-for-newsletter"
            className="block p-3 pe-10 text-sm text-gray-900 outline-none rounded-full w-70 md:w-80 bg-gray-50 placeholder:text-sm"
            placeholder="Your email address"
          />
        </form>
      </div>

      <img src={bannerOneImg2} alt="" loading="lazy" className="hidden md:block w-100 absolute bottom-0 end-6" />
    </div>
  );
};

export default BannerOne;
