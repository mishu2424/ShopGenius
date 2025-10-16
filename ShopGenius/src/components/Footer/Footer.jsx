import { useLenis } from "lenis/react";
import { FaRegArrowAltCircleUp } from "react-icons/fa";

const Footer = ({ navbarRef }) => {
  const lenis = useLenis();
  const handleToTop = () => {
    const target = navbarRef?.current || 0; // 0 = absolute top
    if (lenis) {
      lenis.scrollTo(target, {
        offset: -80, // adjust for sticky header
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      });
    } else {
      // fallback if Lenis not ready
      if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <div>
      <div className="bg-base-300 py-3 px-2 flex justify-end">
        <button
          onClick={handleToTop}
          className="hover:border-none hover:bg-transparent text-xl flex items-center gap-1 cursor-pointer"
        >
          <FaRegArrowAltCircleUp />
          Go to top
        </button>
      </div>
      <footer className="footer sm:footer-horizontal bg-[#2c3641] text-neutral-content grid-rows-2 p-10">
        <nav>
          <h6 className="footer-title">Services</h6>
          <a className="link link-hover">Branding</a>
          <a className="link link-hover">Design</a>
          <a className="link link-hover">Marketing</a>
          <a className="link link-hover">Advertisement</a>
        </nav>
        <nav>
          <h6 className="footer-title">Company</h6>
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Jobs</a>
          <a className="link link-hover">Press kit</a>
        </nav>
        <nav>
          <h6 className="footer-title">Legal</h6>
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">Privacy policy</a>
          <a className="link link-hover">Cookie policy</a>
        </nav>
        <nav>
          <h6 className="footer-title">Social</h6>
          <a className="link link-hover">Twitter</a>
          <a className="link link-hover">Instagram</a>
          <a className="link link-hover">Facebook</a>
          <a className="link link-hover">GitHub</a>
        </nav>
        <nav>
          <h6 className="footer-title">Explore</h6>
          <a className="link link-hover">Features</a>
          <a className="link link-hover">Enterprise</a>
          <a className="link link-hover">Security</a>
          <a className="link link-hover">Pricing</a>
        </nav>
        <nav>
          <h6 className="footer-title">Apps</h6>
          <a className="link link-hover">Mac</a>
          <a className="link link-hover">Windows</a>
          <a className="link link-hover">iPhone</a>
          <a className="link link-hover">Android</a>
        </nav>
      </footer>
    </div>
  );
};

export default Footer;
