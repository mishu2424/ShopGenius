import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import Title from "../../Shared/Title";

import "./NeutralSwiper.css";
import { Link } from "react-router-dom";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { useState } from "react";

const NeutralSwiper = ({ bestProducts }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative">
      {/* Neutral */}
      <Title title={"OTHER"} borderColor={"border-blue-500"} />
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        centeredSlides={true}
        pagination={{
          clickable: true,
        }}
        navigation={{
          nextEl: ".custom-next-btn",
          prevEl: ".custom-prev-btn",
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)} // 👈 Track active slide
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
            centeredSlides: true,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 40,
            centeredSlides: false,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 8,
            centeredSlides: false,
          },
        }}
        modules={[Navigation]}
        className="mySwiper"
      >
        {bestProducts.map((product) => (
          <SwiperSlide>
            <Link to={`/product/${product?._id}`}>
              <div
                key={product?._id}
                className="w-full max-w-xs md:mx-0 mx-auto overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800 my-3 duration-300 border border-transparent hover:border-blue-500"
              >
                <Swiper
                  spaceBetween={30}
                  effect={"fade"}
                  navigation={true}
                  modules={[EffectFade, Navigation, Pagination]}
                  className="mySwiper"
                >
                  <SwiperSlide>
                    <img
                      className="object-cover w-full h-52"
                      src={
                        product?.colors[0]?.image || product?.colors[1]?.image
                      }
                      alt={product?.title}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      className="object-cover w-full h-52"
                      src={
                        product?.colors[1]?.image || product?.colors[0]?.image
                      }
                      alt={product?.title}
                    />
                  </SwiperSlide>
                </Swiper>

                <div className="py-5 text-center px-2">
                  <h3
                    className="block text-xl font-bold text-gray-800 dark:text-white truncate"
                    title={product?.title}
                  >
                    {product?.title}
                  </h3>
                  <span className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                    $
                    {product?.discount?.active
                      ? product?.salePrice
                      : product?.price}
                  </span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        className={`custom-prev-btn
            absolute top-2 right-12
            w-9 h-9 grid place-items-center rounded shadow border z-40 transition
            lg:top-36 lg:left-8 lg:right-auto
            lg:w-auto lg:h-auto lg:py-5 lg:px-4
            ${
              activeIndex > 0
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-white text-blue-600 hover:bg-gray-100"
            }`}
        aria-label="Previous"
      >
        <MdOutlineKeyboardArrowLeft className="w-6 h-6 lg:w-5 lg:h-5" />
      </button>

      {/* Next: mobile/tablet top-right corner; desktop original */}
      <button
        className="custom-next-btn
            absolute top-2 right-2
            w-9 h-9 grid place-items-center rounded shadow border z-40
            bg-blue-600 text-white hover:bg-blue-500 transition
            lg:top-36 lg:right-8
            lg:w-auto lg:h-auto lg:py-5 lg:px-4"
        aria-label="Next"
      >
        <MdOutlineKeyboardArrowRight className="w-6 h-6 lg:w-5 lg:h-5" />
      </button>
    </div>
  );
};

export default NeutralSwiper;
