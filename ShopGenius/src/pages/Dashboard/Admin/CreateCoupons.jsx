import { useEffect, useState } from "react";
import {
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Package,
  FolderOpen,
  User,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useCoupons from "../../../hooks/useCoupons";

const CreateCoupons = () => {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);
  const [coupons] = useCoupons();
  console.log({ coupons });

  const getAllIds = async () => {
    const allIds = await axiosSecure("/get-all-ids");
    console.log(allIds.data);
    setIds(new Set(allIds.data));
  };

  useEffect(() => {
    getAllIds();
  }, []);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: "",
    maxDiscountAmount: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
    applicableProducts: "",
    applicableCategories: "",
    createdBy: user?.email,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const { mutateAsync: postToCoupon } = useMutation({
    mutationFn: async (coupon) => {
      const { data } = await axiosSecure.post("/add-coupon", { coupon });
      console.log(data);
      return data;
    },
    onSuccess: (data) => {
      // Only show success toast if coupon was actually inserted
      if (data.insertedId) {
        toast.success("Coupon has been added successfully!");
      }
    },
    onError: (error) => {
      // Handle network errors or 500 errors
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add coupon. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const couponData = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchaseAmount: formData.minPurchaseAmount
        ? parseFloat(formData.minPurchaseAmount)
        : undefined,
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate)
        : undefined,
      usageLimit: formData.usageLimit
        ? parseInt(formData.usageLimit)
        : undefined,
      usedCount: 0,
      isActive: formData.isActive,
      applicableProducts: formData.applicableProducts
        ? [
            ...new Set(
              formData.applicableProducts.split(",").map((p) => p.trim())
            ),
          ]
        : [],
      createdAt: new Date(),
      createdBy: formData.createdBy,
      lastUsedAt: null,
    };

    /*     const codes = [formData.applicableProducts];

    // Check if all codes exist
    console.log({codes});
    const allCodesExist = codes.every((code) => ids.has(code));

    if (!allCodesExist) {
      toast.error("One or more product IDs do not exist in the database!");
      return;
    } */

    /*     const uniqueProducts=[...new Set(couponData.applicableProducts)]
    
    if(uniqueProducts.has)  

    if (coupons.code === couponData.code && coupons.isActive) {
      toast.error(
        `${couponData.code} already exists in database and It is currently active.`
      );
      return;
    } */

    let notExists = [];
    const codes = couponData.applicableProducts;
    console.log(codes);
    const allCodesExist = codes.forEach((code) => {
      console.log({codes,ids});
      console.log(code,ids.has(code));
      if (!ids.has(code)) {
        console.log('entered',code);
        notExists.push(code);
      }
    });

    console.log({allCodesExist,notExists});

    if (!allCodesExist && notExists.length > 0) {
      toast.error(`${notExists.join(", ")} these ids do not exist in the database`);
      return;
    }
    const data = await postToCoupon(couponData);
    console.log("Coupon Created:", data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h1 className="lg:text-3xl md:text-xl text-lg font-bold text-gray-800">
              Create Coupon
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="SUMMER2024"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition uppercase"
              />
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type *
                </label>
                <div className="relative">
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white transition"
                  >
                    <option value="percentage">Percentage (%)</option>
                  </select>
                  {formData.discountType === "percentage" ? (
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  ) : (
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder={
                      formData.discountType === "percentage" ? "10" : "10.00"
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    {formData.discountType === "percentage" ? "%" : "$"}
                  </span>
                </div>
              </div>
            </div>

            {/* Purchase Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Minimum Purchase Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    value={formData.minPurchaseAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Expiry & Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  min="1"
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Applicable Products & Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Applicable Products (IDs)
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="text"
                    name="applicableProducts"
                    value={formData.applicableProducts}
                    onChange={handleChange}
                    placeholder="prod_1, prod_2, prod_3"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated product IDs
                </p>
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Applicable Categories
                </label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="applicableCategories"
                    value={formData.applicableCategories}
                    onChange={handleChange}
                    placeholder="electronics, clothing"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated categories
                </p>
              </div> */}
            </div>

            {/* Created By */}
            {user && user?.email && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Created By *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    disabled
                    type="email"
                    name="createdBy"
                    value={user?.email}
                    onChange={handleChange}
                    required
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Coupon is Active
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition shadow-lg"
            >
              Create Coupon
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCoupons;
