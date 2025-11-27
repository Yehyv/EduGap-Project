import ScrollToTop from "@/shared/utils/ScrollToTop";
import OurServices from "../features/AboutUs/components/OurServices";
import OurFeatures from "../features/AboutUs/components/OurFeatures";
import JoinUs from "../features/AboutUs/components/JoinUs";
import ContactUs from "../features/AboutUs/components/ContactUs";
import AboutUsComponents from "@/features/AboutUs/components/AboutUsComponents";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AboutUs = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="flex flex-col !gap-0">
      <ScrollToTop />

      <section id="about" className="bg-primary">
        <AboutUsComponents />
      </section>

      <section id="services">
        <OurServices />
      </section>

      <section id="features" className="bg-primary">
        <OurFeatures />
      </section>

      <section id="join" className="bg-secondary">
        <JoinUs />
      </section>

      <section id="contact">
        <ContactUs />
      </section>
    </div>
  );
};

export default AboutUs;
