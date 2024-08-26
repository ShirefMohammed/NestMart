import bannerSlider1 from "../../../assets/banners/bannerSlider1.png";

const BannerSlider = () => {
  return (
    <div
      className="w-full px-6 py-10 md:px-10 md:py-16 rounded-lg bg-cover bg-center"
      style={{ backgroundImage: `url(${bannerSlider1})` }}
    >
      <h2 className="mb-5 font-bold text-3xl md:text-5xl max-w-80 md:max-w-115">
        Don't miss amazing grocery deals
      </h2>

      <p className="mb-8 font-medium text-xl text-heavyGray">Sign up for daily newsletter</p>

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
  );
};

export default BannerSlider;
