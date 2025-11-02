import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import Title from "../../Shared/Title";
import { Link } from "react-router-dom";
import { useState } from "react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

const MenSwiper = ({ bestProductsMen }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      {/* MEN */}
      <Title title={"MEN"} borderColor={"border-blue-500"} />
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        navigation={{
          nextEl: ".custom-next-btn3",
          prevEl: ".custom-prev-btn3",
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
        modules={[Navigation]}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)} // 👈 Track active slide
        className="mySwiper"
      >
        {bestProductsMen.map((product) => (
          <SwiperSlide>
            <Link to={`/product/${product?._id}`}>
              <div
                key={product?._id}
                className="w-full max-w-xs overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 my-3 hover:scale-105 duration-300 border border-transparent hover:border-blue-500"
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
                    ${product?.discount?.active ? product?.salePrice : product?.price}
                  </span>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex justify-center gap-4 mt-4 relative">
        <button
          className={`absolute left-8 -top-52 py-5 custom-prev-btn3 z-40 px-4 cursor-pointer rounded transition-all duration-300 ${
            activeIndex > 0
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-white text-blue-500 hover:bg-gray-100"
          }`}
        >
          <IoIosArrowDropleft />
        </button>
        <button className="absolute right-8 -top-52 py-5 custom-next-btn3 bg-blue-600 text-white px-4 cursor-pointer rounded hover:bg-blue-500 transition-all duration-300 z-40">
          <IoIosArrowDropright />{" "}
        </button>
      </div>
    </div>
  );
};

export default MenSwiper;
