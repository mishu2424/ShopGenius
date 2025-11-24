import React from "react";
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
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
const RecentBoughtCategories = () => {
  const { user } = useAuth() || {};
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: recentBoughtProducts, isLoading: isBoughtProductsLoading } =
    useQuery({
      queryKey: ["suggestions", user?.email],
      enabled: !!user?.email,
      queryFn: async () => {
        const { data } = await axiosSecure(
          `/recent-bought?recentBoughtCat=${true}`
        );
        return data;
      },
    });

  if (isBoughtProductsLoading) return <LoadingSpinner />;
  return (
    <>
      {recentBoughtProducts?.length > 0 && (
        <Container>
          <div className="relative">
            <Title
              title={"Suggested Products"}
              borderColor={"border-blue-500"}
              icon={HiMiniCheckBadge}
              iconColor={"text-blue-500"}
            />
            {/* <div className="border"> */}
            <Swiper
              slidesPerView={1}
              spaceBetween={10}
              centeredSlides={true}
              pagination={{
                clickable: true,
              }}
              navigation={{
                nextEl: ".custom-next-btn4",
                prevEl: ".custom-prev-btn4",
              }}
              breakpoints={{
                640: {
                  slidesPerView: 1,
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
                  spaceBetween: 10,
                  centeredSlides: false,
                },
              }}
              modules={[Navigation]}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)} // 👈 Track active slide
              className="mySwiper custom-swiper"
            >
              {recentBoughtProducts.map((product) => (
                <SwiperSlide>
                  <Link to={`/product/${product?._id}`}>
                    <div
                      key={product?._id}
                      className="w-full max-w-xs mx-auto md:mx-5 overflow-hidden bg-white rounded-lg shadow dark:bg-gray-800 my-3 hover:scale-105 duration-300 border border-transparent hover:border-blue-500"
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
            <button
              className={`custom-prev-btn4
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
              className="custom-next-btn4
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
        </Container>
      )}
    </>
  );
};

export default RecentBoughtCategories;
