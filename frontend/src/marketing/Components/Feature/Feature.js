import React, { useEffect } from "react";
import "./Feature.css";
import Aos from "aos";
import "aos/dist/aos.css";
import img1 from "../../ikea.jpg";
import img2 from "../../Google-Logo.wine.svg";
import img3 from "../../1280px-GoDaddy_logo.svg.png";
import img4 from "../../yahoo.svg";

const Feature = () => {
  useEffect(() => {
    Aos.init({ duration: 2000 });
  }, []);

  return (
    <section className="featureSection" id="Resources">
      <div className="featuredinSection">
        <h3 data-aos="fade-up" className="featureHeading">
          Featured in
        </h3>
        <div data-aos="fade-up" className="companySection">
          <ul className="companyLogo grid">
            <li className="listItems">
              <img src={img1} alt="IKEA" />
            </li>
            <li className="listItems">
              <img src={img2} alt="google" />
            </li>
            <li className="listItems">
              <img src={img3} className="godaddyLogo" alt="godaddy" />
            </li>
            <li className="listItems">
              <img src={img4} alt="yahoo" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Feature;


