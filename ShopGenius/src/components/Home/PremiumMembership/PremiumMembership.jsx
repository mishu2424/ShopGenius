import React, { useState } from "react";
import videoShopGenius from "../../../assets/videos/video-shop-genius.mp4";
import Container from "../../Shared/Container";
import Title from "../../Shared/Title";

const PremiumMembership = () => {
  const [annual, setAnnual] = useState(false);
  const monthly = 7.99;
  const annualPrice = 76.7; // ~20% off (7.99 * 12 * 0.8)

  return (
    <div className="my-10">
      <Container>
        <Title title={"Premium Membership"} borderColor={"border-blue-500"} />
        <div className="grid grid-cols-12 gap-3">
          {/* Video */}
          <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
            <video
              autoPlay muted loop controls
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
                  <button
                    onClick={() => setAnnual(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      !annual ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setAnnual(true)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      annual ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Annual <span className="ml-1 text-emerald-400">Save 20%</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold">
                    {annual ? `$${annualPrice.toFixed(2)}` : `$${monthly.toFixed(2)}`}
                  </span>
                  <span className="mb-1 text-sm text-gray-300">
                    {annual ? "/ year" : "/ month"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">Cancel anytime.</p>

                <button className="mt-4 w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-[.99] transition shadow-lg shadow-blue-900/30 py-3 font-semibold">
                  {annual ? "Start Annual Plan" : "Start 30-Day Free Trial"}
                </button>

                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    "Free Express Delivery on eligible items",
                    "Member-Only Deals & lightning sales",
                    "Priority Support with dedicated chat",
                    "Early Access to new drops & restocks",
                  ].map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-block h-5 w-5 rounded-full bg-green-500/20 text-green-400 grid place-items-center">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-gray-300">
                  After trial, plan auto-renews unless canceled. By continuing, you agree to the Terms.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PremiumMembership;
