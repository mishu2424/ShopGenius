import React from "react";
import { Link } from "react-router-dom";

const BannerCard = ({ items, message }) => {
  console.log(items, message);
  return (
    <div className="grid grid-cols-2">
      {items.length > 2
        ? items.slice(0, 4).map((item) => (
            <div
              key={item?._id}
              className="flex items-center justify-center flex-wrap py-2"
            >
              <Link
                to={
                  message === "carts"
                    ? `/product/${item?.productId}`
                    : message === "popular"
                    ? `/product/${item?._id}`
                    : `/product/${item?.productBookingId}`
                }
              >
                <img
                  src={
                    message === "carts" || message === "recent-bought-products"
                      ? item?.selectedImage
                      : item?.colors[0]?.image[0]
                  }
                  className="w-40 h-40 object-cover rounded-sm cursor-pointer hover:opacity-80 hover:brightness-75 duration-300"
                />
              </Link>
            </div>
          ))
        : items.length === 2
        ? items.map((item) => (
            <div
              key={item?._id}
              className="col-span-2 flex flex-col items-center justify-center flex-wrap py-3"
            >
              <Link
                to={
                  message === "carts"
                    ? `/product/${item?.productId}`
                    : message === "popular"
                    ? `/product/${item?._id}`
                    : `/product/${item?.productBookingId}`
                }
              >
                <img
                  src={
                    message === "carts" || message === "recent-bought-products"
                      ? item?.selectedImage
                      : item?.colors[0]?.image[0]
                  }
                  className="w-60 h-32 object-cover rounded-sm cursor-pointer hover:opacity-80 hover:brightness-75 duration-300"
                />
              </Link>
            </div>
          ))
        : items?.length === 1 &&
          items.map((item) => (
            <div key={item?._id} className="col-span-2 py-1.5">
              <Link
                to={
                  message === "carts"
                    ? `/product/${item?.productId}`
                    : message === "popular"
                    ? `/product/${item?._id}`
                    : `/product/${item?.productBookingId}`
                }
              >
                <img
                  src={
                    message === "carts" || message === "recent-bought-products"
                      ? item?.selectedImage
                      : item?.colors[0]?.image[0]
                  }
                  className="w-full h-84 object-contain rounded cursor-pointer hover:opacity-80 hover:brightness-75 duration-300"
                />
              </Link>
            </div>
          ))}
    </div>
  );
};

export default BannerCard;
