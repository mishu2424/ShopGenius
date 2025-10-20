import { useState } from "react";
import { IoEyeOutline } from "react-icons/io5";

const ProductImageHover = ({ product }) => {
  const [hover, setHover] = useState(false);
  const img1 = product?.colors[0]?.image?.[0];
  const img2 = product?.colors[0]?.image?.[1];

  return (
    <div className="relative">
      <div
        className="relative w-full h-64 perspective-1000"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 group"
          style={{
            transformStyle: "preserve-3d",
            transform: hover ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front Image */}
          <img
            src={img1}
            alt={product.title}
            className="absolute w-full h-full object-contain rounded-t-xl group-hover:opacity-80 group-hover:brightness-75"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />

          {/* Back Image */}
          <img
            src={img2}
            alt={product.title}
            className="absolute w-full h-full object-contain rounded-t-xl group-hover:opacity-80 group-hover:brightness-75"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          />

          <IoEyeOutline
            className="absolute left-1/2 
      -translate-x-1/2 
      top-1/2 z-20 text-white opacity-0 group-hover:opacity-100 hover:text-blue-500
      transition-all duration-500 ease-in-out"
            size={20}
          />
        </div>
      </div>

      {product.discount?.active && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md z-10">
          -{product.discount?.value || 0}%
        </span>
      )}
      <span
        className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-md z-10 ${
          product.availability?.status === "in_stock"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {product.availability?.status.replace("_", " ")}
      </span>
      {product?.new && (
        <span className="absolute bottom-3 left-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md z-10">
          New
        </span>
      )}
      {product?.BestSeller && (
        <span className="absolute bottom-3 right-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-md z-10">
          BestSeller
        </span>
      )}
    </div>
  );
};

export default ProductImageHover;
