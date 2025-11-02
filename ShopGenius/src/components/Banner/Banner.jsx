import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import Slide from "./Slide";
import useCart from "../../hooks/useCart";
import BannerCard from "../Shared/cards/BannerCard";
import LoadingSpinner from "../Shared/LoadingSpinner";
import Container from "../Shared/Container";
import usePopularProducts from "../../hooks/usePopularProducts";
import useRecentBoughtProducts from "../../hooks/useRecentBoughtProducts";
const Banner = () => {
  const [carts, isCartLoading] = useCart();
  const [popularProducts, isPopularProductsLoading] = usePopularProducts();
  const [recentBoughtProducts, isBoughtProductsLoading] =
    useRecentBoughtProducts(false);

  // console.log(carts);
  if (isCartLoading || isPopularProductsLoading) return <LoadingSpinner />;
  return (
    <>
      <div>
        <Swiper navigation={true} modules={[Navigation]} className="mySwiper">
          <SwiperSlide>
            <Slide
              bannerImg={"https://i.ibb.co/ycZVJb3L/51-WB3be6f-BL-SX3000.jpg"}
            ></Slide>
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              bannerImg={"https://i.ibb.co/CKZRF4Wr/71-RFCs-Bmdj-L-SX3000.jpg"}
            ></Slide>
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              bannerImg={
                "https://i.ibb.co/fd7xxphP/beautiful-dark-skinned-woman-surrounded-by-clothes-rack.jpg"
              }
            ></Slide>
          </SwiperSlide>
          <SwiperSlide>
            <Slide
              bannerImg={
                "https://i.ibb.co/7NT92xLD/premium-photo-1661769021743-7139c6fc4ab9.jpg"
              }
            ></Slide>
          </SwiperSlide>
        </Swiper>
      </div>
      <div className="max-w-[2000px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4 relative -top-20 z-30">
        <div className="flex flex-col md:flex-row items-center justify-center gap-5">
          {carts.length > 0 && (
            <div className="w-[350px] h-[380px] border border-transparent rounded-md shadow-2xl bg-white">
              <h2 className="text-xl font-semibold text-center text-gray-500">
                Carts
              </h2>
              <BannerCard items={carts} message="carts" />
            </div>
          )}
          {popularProducts.length > 0 && (
            <div className="w-[350px] h-[380px] border border-transparent rounded-md shadow-2xl bg-white">
              <h2 className="text-xl font-semibold text-center text-gray-500">
                Popular Products
              </h2>
              <BannerCard items={popularProducts} message="popular" />
            </div>
          )}
          {recentBoughtProducts?.length > 0 && (
            <div className="w-[350px] h-[380px] border border-transparent rounded-md shadow-2xl bg-white">
              <h2 className="text-xl font-semibold text-center text-gray-500">
                Recently Bought Products
              </h2>
              <BannerCard
                items={recentBoughtProducts}
                message="recent-bought-products"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Banner;
