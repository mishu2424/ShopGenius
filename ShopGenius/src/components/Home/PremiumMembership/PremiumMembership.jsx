import React, { useEffect, useState } from "react";
import videoShopGenius from "../../../assets/videos/video-shop-genius.mp4";
import Container from "../../Shared/Container";
import Title from "../../Shared/Title";
import useAuth from "../../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosSecure } from "../../../hooks/useAxiosSecure";
import useSubscription from "../../../hooks/useSubscription";
import LoadingSpinner from "../../Shared/LoadingSpinner";
import { FaSpinner } from "react-icons/fa6";
import Swal from "sweetalert2";
import "animate.css";
import "sweetalert2/themes/material-ui.css";

const PremiumMembership = () => {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changeSubLoading, setChangeSubLoading] = useState(false);
  const [reactivateSubLoading, setReactivateSubLoading] = useState(false);
  const [cancelSubLoading, setCancelSubLoading] = useState(false);
  const [error, setError] = useState("");
  const monthly = 9.99;
  const annualPrice = 95.99; // ~20% off (9.99 * 12 * 0.8)
  const { user } = useAuth() || {};
  const [subscription, userSubscriptionLoading] = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (subscription && subscription?.subscriptionPlan === "standard_monthly") {
      setAnnual(true);
    } else {
      setAnnual(false);
    }
  }, [subscription]);

  //subscription
  const { mutateAsync: subscriptionAsync } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosSecure.post(`/create-subscription-checkout`, {
        userId: user?.uid,
        userEmail: user?.email,
        planType: annual ? "standard_yearly" : "standard_monthly",
      });
      return data;
    },
  });

  const handleUserSubscription = async () => {
    setLoading(true);
    setError("");

    if (!user || !user?.email) {
      navigate(`/login`, { state: { from: location }, replace: false });
      setLoading(false);
      return;
    } else {
      try {
        const data = await subscriptionAsync();

        //redirect to Stripe checkout
        // New way: just use the URL Stripe gives you
        if (data?.url) {
          window.location.href = data.url; // full-page redirect
        } else {
          setError("Failed to start checkout. Please try again.");
        }
      } catch (err) {
        console.error(err.message);
        toast.error(err.message);
        setError("Failed to start checkout. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // cancel subscription
  const { mutateAsync: cancelSubscriptionAsync } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosSecure.post(`/cancel-subscription`, {
        subscriptionId: subscription?.subscriptionId,
      });
      return data;
    },
  });

  const cancelSubscription = async () => {
    Swal.fire({
      title: "Are you sure?",
      theme: "auto",
      icon: "question",
      showCancelButton: true,
      animation: true,
      confirmButtonText: "Yes, cancel the subscription!",
      showClass: {
        popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
      },
      hideClass: {
        popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCancelSubLoading(true);
        try {
          await cancelSubscriptionAsync();
          setCancelSubLoading(false);
        } catch (err) {
          toast.error(err.message);
          setCancelSubLoading(false);
        } finally {
          setCancelSubLoading(false);
        }
      }
    });
  };

  // Change plan from monthly to yearly
  const { mutateAsync: changePlanAsync } = useMutation({
    mutationFn: async (planType) => {
      const { data } = await axiosSecure.post("/change-subscription-plan", {
        subscriptionId: subscription?.subscriptionId,
        newPlanType: planType,
      });
      return data;
    },
    onSuccess: () => {
      // Refetch subscription data
      queryClient.invalidateQueries(["subscription"]);
    },
  });

  const handleChangePlan = async (planType) => {
    Swal.fire({
      title: "Are you sure?",
      theme: "material-ui",
      icon: "question",
      showCancelButton: true,
      animation: true,
      confirmButtonText: "Yes, change the plan!",
      showClass: {
        popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
      },
      hideClass: {
        popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setChangeSubLoading(true);

        if (!subscription.subscriptionPlan || !subscription?.subscriptionId) {
          setChangeSubLoading(false);
          return;
        }
        try {
          await changePlanAsync(planType);
          toast.success(`Successfully switched to Annual plan`);
          Swal.fire({
            title: "Changed Plan!",
            text: "Your plan has been changed successfully!.",
            icon: "success",
          });
        } catch (err) {
          console.error("Error changing plan:", err);
          toast.error(err.message || "Failed to change plan");
        } finally {
          setChangeSubLoading(false);
        }
      }
    });
  };

  // Reactivate subscription
  const { mutateAsync: reactivateSubscriptionAsync } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosSecure.post("/reactivate-subscription", {
        subscriptionId: subscription?.subscriptionId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subscription"]);
      toast.success("Subscription reactivated!");
    },
  });

  const handleReactivateSubscription = async () => {
    Swal.fire({
      title: "Are you sure?",
      theme: "auto",
      icon: "question",
      showCancelButton: true,
      animation: true,
      confirmButtonText: "Yes, reactivate the subscription!",
      showClass: {
        popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
      },
      hideClass: {
        popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setReactivateSubLoading(true);

        try {
          await reactivateSubscriptionAsync();
        } catch (err) {
          console.error("Reactivation error:", err);
          toast.error(
            err?.response?.data?.error || "Failed to reactivate subscription"
          );
        } finally {
          setReactivateSubLoading(false);
        }
      }
    });
  };

  console.log(subscription);

  if (userSubscriptionLoading) return <LoadingSpinner />;
  return (
    <div className="my-10">
      <Container>
        <Title title={"Premium Membership"} borderColor={"border-blue-500"} />
        <div className="grid grid-cols-12 gap-3">
          {/* Video */}
          <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
            <video
              autoPlay
              muted
              loop
              controls
              className="w-full h-[400px] object-cover brightness-110 rounded-md"
            >
              <source src={videoShopGenius} />
            </video>
          </div>

          {/* Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl border border-white/10 bg-gradient-to-b from-[#1e293b] via-[#1f2a37] to-[#0f172a] text-white">
              <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

              <div className="p-6 border-b border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold">
                  ⭐ PREMIUM
                </div>
                <h3 className="mt-3 text-2xl font-bold">ShopGenius Prime</h3>
                <p className="mt-1 text-sm text-gray-300">
                  Fast delivery, exclusive deals, VIP support — all in one.
                </p>

                {/* Toggle */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/5 p-1 border border-white/10">
                  {!subscription?.hasSubscription ? (
                    <>
                      <button
                        onClick={() => setAnnual(false)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          !annual
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setAnnual(true)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          annual
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        Annual{" "}
                        <span className="ml-1 text-emerald-400">Save 20%</span>
                      </button>
                    </>
                  ) : (
                    subscription?.subscriptionPlan === "standard_monthly" && (
                      <button
                        onClick={() => setAnnual(true)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          annual
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:text-white"
                        }`}
                      >
                        Annual{" "}
                        <span className="ml-1 text-emerald-400">Save 20%</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold">
                    {annual
                      ? `$${annualPrice.toFixed(2)}`
                      : `$${monthly.toFixed(2)}`}
                  </span>
                  <span className="mb-1 text-sm text-gray-300">
                    {annual ? "/ year" : "/ month"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">Cancel anytime.</p>

                {!subscription?.hasSubscription && (
                  <button
                    disabled={loading}
                    onClick={handleUserSubscription}
                    className={`disabled:bg-blue-200 mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[.99] transition shadow-lg shadow-blue-900/30 py-3 font-semibold`}
                  >
                    {loading
                      ? "Processing..."
                      : annual
                      ? "Start Annual Plan"
                      : "Start Monthly Plan"}
                  </button>
                )}
                {subscription?.hasSubscription &&
                  (subscription?.subscriptionPlan === "standard_monthly" ? (
                    <button
                      disabled={loading}
                      onClick={() => handleChangePlan("standard_yearly")}
                      className={`disabled:bg-blue-200 mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[.99] transition shadow-lg shadow-blue-900/30 py-3 font-semibold`}
                    >
                      {changeSubLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <FaSpinner className="animate-spin" />
                          <h5 className="text-sm">Processing...</h5>
                        </div>
                      ) : (
                        "Change Plan To Annual"
                      )}
                    </button>
                  ) : (
                    <button
                      disabled={loading}
                      onClick={() => handleChangePlan("standard_monthly")}
                      className={`disabled:bg-blue-200 mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[.99] transition shadow-lg shadow-blue-900/30 py-3 font-semibold`}
                    >
                      {changeSubLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <FaSpinner className="animate-spin" />
                          <h5 className="text-sm">Processing...</h5>
                        </div>
                      ) : (
                        "Change Plan To Monthly"
                      )}
                    </button>
                  ))}
                {error ? (
                  <span className="text-xs text-red-500">{error}</span>
                ) : (
                  ""
                )}

                {subscription?.hasSubscription && (
                  <button
                    disabled={loading}
                    onClick={cancelSubscription}
                    className={`disabled:bg-blue-200 mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[.99] transition shadow-lg shadow-blue-900/30 py-3 font-semibold`}
                  >
                    {cancelSubLoading ? (
                      <span>
                        <FaSpinner className="animate-spin m-auto" />
                        Processing...
                      </span>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </button>
                )}

                {subscription?.hasSubscription &&
                  subscription?.subscriptionStatus ===
                    "scheduled_cancellation" && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Your subscription will be cancelled on{" "}
                        <strong>
                          {new Date(
                            subscription.subscriptionEndDate
                          ).toLocaleDateString()}
                        </strong>
                      </p>
                      <button
                        onClick={handleReactivateSubscription}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Reactivate subscription
                        {reactivateSubLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin" />
                            <h5 className="text-sm">Processing...</h5>
                          </div>
                        ) : (
                          "Reactivate subscription"
                        )}
                      </button>
                    </div>
                  )}

                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    "Free Express Delivery on eligible items",
                    "Member-Only Deals & lightning sales",
                    "Priority Support with dedicated chat",
                    "Early Access to new drops & restocks",
                  ].map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-green-500/20 text-green-400 grid place-items-center">
                        ✓
                      </span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PremiumMembership;
