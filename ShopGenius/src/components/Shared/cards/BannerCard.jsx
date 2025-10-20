import React from "react";
import { Link } from "react-router-dom";

const BannerCard = ({ items, message }) => {
//   console.log(items);
  return (
    <div className="grid grid-cols-2">
      {items.length > 2
        ? items.slice(0, 4).map((item) => (
            <div
              key={item?._id}
              className="flex items-center justify-center flex-wrap py-5"
            >
              <Link
                to={
                  message === "carts"
                    ? `/product/${item?.productId}`
                    : `/product/${item?._id}`
                }
              >
                <img
                  src={
                    message === "carts" ? item?.img : item?.colors[0]?.image[0]
                  }
                  className="w-40 h-40 object-cover rounded-sm cursor-pointer hover:opacity-80 hover:brightness-75 duration-300"
                />
              </Link>
            </div>
          ))
        : items.map((item) => (
            <div
              key={item?._id}
              className="col-span-2 flex flex-col items-center justify-center flex-wrap py-5"
            >
              <Link
                to={
                  message === "carts"
                    ? `/product/${item?.productId}`
                    : `/product/${item?._id}`
                }
              >
                <img
                  src={
                    message === "carts" ? item?.img : item?.colors[0]?.image[0]
                  }
                  className="w-60 h-40 object-top object-cover rounded-sm cursor-pointer hover:opacity-80 hover:brightness-75 duration-300"
                />
              </Link>
            </div>
          ))}
    </div>
  );
};

export default BannerCard;
