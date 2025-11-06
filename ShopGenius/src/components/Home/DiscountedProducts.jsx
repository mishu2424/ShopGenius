import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../Shared/LoadingSpinner";
import useAxiosCommon from "../../hooks/useAxiosCommon";
import { MdDiscount } from "react-icons/md";
import { Link } from "react-router";

import "./DiscountedProduct.css";

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Container from "../Shared/Container";
import Title from "../Shared/Title";

// swiper js
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { EffectFade, Navigation, Pagination } from "swiper/modules";

const DiscountedProducts = () => {
  const axiosCommon = useAxiosCommon();
  const { data: discountedProducts, isLoading } = useQuery({
    queryKey: ["discounted-products"],
    queryFn: async () => {
      const { data } = await axiosCommon("/discounted-products");
      return data;
    },
  });
  var settings = {
    dots: false,
    infinite: false,
    speed: 300,
    lazyLoad: true,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: false,
          dots: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 820,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  // console.log(discountedProducts);
  if (isLoading) return <LoadingSpinner />;
  return (
    <Container>
      <div className="my-10">
        <Title
          title={"Sale"}
          borderColor={"border-red-500"}
          icon={MdDiscount}
          iconColor={"text-red-500"}
        />
        <div className="relative">
          <Slider {...settings}>
            {discountedProducts.map((product) => (
              <Link to={`/product/${product?._id}`} key={product.productId}>
                <div className="max-w-xs md:ml-4 lg:ml-0 mx-auto rounded border border-transparent hover:border-purple-500 hover:scale-105 cursor-pointer duration-500 flex flex-col bg-white shadow-lg dark:bg-gray-800">
                  {/* Title + Description */}
                  <div className="px-4 py-4">
                    <h1
                      className="text-xl font-bold text-gray-800 uppercase dark:text-white truncate"
                      title={product?.title}
                    >
                      {product?.title}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                      {product?.description}
                    </p>
                  </div>

                  <div className="slider-container">
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
                            product?.colors[0]?.image ||
                            product?.colors[1]?.image
                          }
                          alt={product?.title}
                        />
                      </SwiperSlide>
                      <SwiperSlide>
                        <img
                          className="object-cover w-full h-52"
                          src={
                            product?.colors[1]?.image ||
                            product?.colors[0]?.image
                          }
                          alt={product?.title}
                        />
                      </SwiperSlide>
                    </Swiper>
                  </div>

                  {/* Price + Button (stick to bottom) */}
                  <div>
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 mt-auto">
                      <h5 className="text-lg font-bold text-white">
                        ${product?.price}
                      </h5>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Slider>
        </div>
      </div>
    </Container>
  );
};

function NextArrow({ className, onClick }) {
  const isDisabled = className?.includes("slick-disabled");

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`absolute top-1/2 right-3 z-20 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full p-2 bg-[#2381D3] text-white 
      ${
        isDisabled
          ? "opacity-40 cursor-default bg-gray-500"
          : "hover:bg-blue-700 cursor-pointer"
      }`}
    >
      ❯
    </div>
  );
}

function PrevArrow({ className, onClick }) {
  const isDisabled = className?.includes("slick-disabled");
  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`absolute top-1/2 left-3 z-20 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-white bg-[#2381D3] transition
        ${
          isDisabled
            ? "opacity-40 cursor-default bg-gray-500"
            : "cursor-pointer hover:bg-blue-700"
        }
      `}
    >
      ❮
    </div>
  );
}

export default DiscountedProducts;
