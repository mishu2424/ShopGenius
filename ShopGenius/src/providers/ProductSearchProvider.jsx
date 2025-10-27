import { useState } from "react";
import { ProductContext } from "../contexts/ProductContext";

const ProductSearchProvider = ({ children }) => {
  const [searchTxt, setSearchTxt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState("");
  const [sortText, setSortText] = useState("");
  // console.log(searchTxt);

  const searchInfo = {
    searchTxt,
    setSearchTxt,
    currentPage,
    setCurrentPage,
    category,
    setCategory,
    sortText,
    setSortText
  };
  return (
    <ProductContext.Provider value={searchInfo}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductSearchProvider;
