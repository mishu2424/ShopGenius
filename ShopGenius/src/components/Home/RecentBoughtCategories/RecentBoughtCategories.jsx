import React from "react";
import useRecentBoughtProducts from "../../../hooks/useRecentBoughtProducts";
import Container from "../../Shared/Container";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import Title from "../../Shared/Title";
import { HiMiniCheckBadge } from "react-icons/hi2";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { EffectFade, Navigation, Pagination } from "swiper/modules";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";
const RecentBoughtCategories = () => {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: recentBoughtProducts, isLoading: isBoughtProductsLoading } =
    useQuery({
      queryKey: ["suggestions"],
      queryFn: async () => {
        const { data } = await axiosSecure(
          `/recent-bought/${user?.email}?recentBoughtCat=${true}`
        );
        return data;
      },
    });

  console.log(recentBoughtProducts);

  if (isBoughtProductsLoading) return <LoadingSpinner />;
  return (
    <Container>
      <Title
        title={"Suggested Products For You"}
        borderColor={"border-blue-500"}
        icon={HiMiniCheckBadge}
        iconColor={"text-blue-500"}
      />
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        pagination={{
          clickable: true,
        }}
        navigation={{
          nextEl: ".custom-next-btn4",
          prevEl: ".custom-prev-btn4",
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
        {recentBoughtProducts.map((product) => (
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
                        product?.colors[0]?.image[0] ||
                        product?.colors[0]?.image[1]
                      }
                      alt={product?.title}
                    />
                  </SwiperSlide>
                  <SwiperSlide>
                    <img
                      className="object-cover w-full h-52"
                      src={
                        product?.colors[0]?.image[1] ||
                        product?.colors[0]?.image[0]
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
                  {/* <span className="text-sm text-gray-700 dark:text-gray-200">
                    Software Engineer
                  </span> */}
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex justify-center gap-4 mt-4 relative">
        <button
          className={`absolute left-8 -top-52 py-5 custom-prev-btn4 z-40 px-4 cursor-pointer rounded transition-all duration-300 ${
            activeIndex > 0
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-white text-blue-500 hover:bg-gray-100"
          }`}
        >
          <IoIosArrowDropleft />
        </button>
        <button className="absolute right-8 -top-52 py-5 custom-next-btn4 bg-blue-600 text-white px-4 cursor-pointer rounded hover:bg-blue-500 transition-all duration-300 z-40">
          <IoIosArrowDropright />{" "}
        </button>
      </div>
    </Container>
  );
};

export default RecentBoughtCategories;
