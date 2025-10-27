import { useQuery } from "@tanstack/react-query";
import useAxiosCommon from "../../hooks/useAxiosCommon";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import ProductImageHover from "./ProductImageHover";
import { ProductContext } from "../../contexts/ProductContext";
import ProductButtons from "../../components/Shared/Button/ProductButtons";
import Title from "../../components/Shared/Title";
import { Helmet } from "react-helmet-async";

const CATEGORIES = ["Electronics", "Clothes", "Beauty", "Accessories", "Home"];

// UI label -> backend value
const SORT_OPTIONS = [
  { label: "Price: Low to high", value: "asc" },
  { label: "Price: High to low", value: "desc" },
  { label: "Rating: High to low", value: "desc-r" },
  { label: "Rating: Low to high", value: "asc-r" },
];

export default function Products() {
  const axiosCommon = useAxiosCommon();

  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [count, setCount] = useState(0);

  const {
    searchTxt,
    setSearchTxt,
    currentPage,
    setCurrentPage,
    category,
    setCategory,
    sortText,
    setSortText,
  } = useContext(ProductContext);

  // filter flags (booleans)
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [popular, setPopular] = useState(false);

  // ---- DATA ----
  const { data: products = [], isLoading } = useQuery({
    queryKey: [
      "products",
      currentPage,
      category,
      searchTxt,
      sortText,
      inStockOnly,
      onSaleOnly,
      itemsPerPage,
      popular,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        category: category ?? "",
        search: searchTxt ?? "",
        sort: sortText ?? "", // e.g., price_asc
        inStock: String(inStockOnly), // "true" / "false"
        onSale: String(onSaleOnly), // "true" / "false"
        popular: String(popular), // "true" / "false"
      });
      const { data } = await axiosCommon(`/products?${params.toString()}`);
      return data;
    },
  });

  useEffect(() => {
    const getCount = async () => {
      const params = new URLSearchParams({
        category: category ?? "",
        search: searchTxt ?? "",
        inStock: String(inStockOnly),
        onSale: String(onSaleOnly),
        popular: String(popular),
      });
      const { data } = await axiosCommon(
        `/products-count?${params.toString()}`
      );
      setCount(data.count);
    };
    getCount();
  }, [axiosCommon, category, searchTxt, inStockOnly, onSaleOnly, popular]);

  const totalPages = Math.ceil(count / itemsPerPage);
  const pages = [...Array(totalPages).keys()].map((i) => i + 1);

  if (isLoading) return <LoadingSpinner />;
  // console.log(products);
  return (
    <>
      <Helmet>
        <title>Products | ShopGenius</title>
      </Helmet>
      {!sortText && (
        <Title title={"All Products"} borderColor={"border-blue-500"} />
      )}
      <div className="flex flex-col lg:flex-row gap-6 m-5 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 border border-transparent rounded-xl bg-white shadow-sm p-4 space-y-6 self-start">
          {/* Categories (single) */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Categories</h3>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => {
                const value = cat.toLowerCase();
                return (
                  <li key={cat}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={category === value}
                        onChange={() => {
                          setCurrentPage(1);
                          setSearchTxt(""); // optional: clear search when picking category
                          setCategory(value);
                        }}
                        className="radio radio-sm"
                      />
                      <span className="capitalize text-sm">{cat}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Filters (booleans) */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Filters</h3>
            <ul className="space-y-2">
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setCurrentPage(1);
                      // console.log(e.target.checked);
                      setInStockOnly(e.target.checked);
                    }}
                  />
                  In Stock Only
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={onSaleOnly}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setOnSaleOnly(e.target.checked);
                    }}
                  />
                  On Sale Only
                </label>
              </li>
              <li>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={popular}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setPopular(e.target.checked);
                    }}
                  />
                  Best Seller
                </label>
              </li>
            </ul>
          </div>

          {/* Sort (single) */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Sort</h3>
            <ul className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="sort"
                      className="radio radio-sm"
                      value={opt.value}
                      checked={sortText === opt.value}
                      onChange={() => {
                        setCurrentPage(1);
                        setSortText(opt.value); // ✅ valid backend value
                      }}
                    />
                    {opt.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main products section */}
        <main className="flex-1">
          {products.length === 0 ? (
            <p className="text-center text-gray-500 text-lg py-10">
              No products found. 🛍️
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {products.map((product) => (
                <div
                  key={product.productId}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg border border-transparent transition transform hover:-translate-y-1"
                >
                  <Link to={`/product/${product._id}`}>
                    <ProductImageHover product={product} />
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-800 text-lg truncate">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-blue-600">
                            ${product.salePrice.toFixed(2)}
                          </p>
                          {product.discount?.active && (
                            <p className="text-xs line-through text-gray-400">
                              ${product.price.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center text-yellow-500">
                          {Array.from({ length: product.rating }).map(
                            (_, i) => (
                              <FaStar key={i} />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <ProductButtons
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            pages={pages}
            totalPages={totalPages}
          />
        </main>
      </div>
    </>
  );
}
