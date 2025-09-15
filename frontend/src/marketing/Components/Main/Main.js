import React, { useEffect } from "react";
import "./Main.css";
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { BsGraphUp } from "react-icons/bs";
import { GiProgression } from "react-icons/gi";
import { BiCalendar } from "react-icons/bi";
import { BsFileBarGraph } from "react-icons/bs";

import img1 from "../../img 6.png";
import img2 from "../../img7.png.jpg";

import Aos from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

const Main = () => {
  const navigate = useNavigate();
  useEffect(() => {
    Aos.init({ duration: 2000 });
  }, []);
  return (
    <div className="mainSection" id="Features">
      <div className="mainSection1 flex">
        <div data-aos="fade-right" className="featureImg">
          <img src={img1} alt="Feature" />
        </div>
        <div data-aos="fade-right" className="featureContent">
          <h1>Intuitive CRM to get you conversions</h1>
          <p>
            With intuitive features, making Xeno CRM superior to many similar
            competitors
          </p>
          <ul className="featureContentLinks grid">
            <li>
              <a href="#Track Progress">
                <BsGraphUp className="icon" /> Track Progress
              </a>
            </li>
            <li>
              <a href="#Visual Sales">
                <GiProgression className="icon" /> Visual Sales
              </a>
            </li>
            <li>
              <a href="#Daily Reporting">
                <BiCalendar className="icon" /> Daily Reporting
              </a>
            </li>
            <li>
              <a href="#Revenue Forecasting">
                <BsFileBarGraph className="icon" /> Revenue Forecasting
              </a>
            </li>
          </ul>
          <button className="featureBtn" onClick={() => navigate("/login")}>Get Free Trial <BsFillArrowRightCircleFill className="icon" /></button>
        </div>
      </div>

      <div className="mainSection2 flex" id="Pricing">
        <div data-aos="fade-left" className="featureContent featureContent2">
          <h1>Integrate, collaborate, and grow with Xeno CRM</h1>
          <p>
            With cloud features, make sure your business can collaborate easily.
          </p>
          <ul className="featureContentLinks grid">
            <li>
              <a href="#Marketing Cloud">
                <BsGraphUp className="icon" /> Marketing Cloud
              </a>
            </li>
            <li>
              <a href="#AppConnect">
                <GiProgression className="icon" /> AppConnect
              </a>
            </li>
            <li>
              <a href="#Insightly Marketing">
                <BiCalendar className="icon" /> Insightly Marketing
              </a>
            </li>
            <li>
              <a href="#Build relationships">
                <BsFileBarGraph className="icon" /> Build relationships
              </a>
            </li>
          </ul>
          <button className="featureBtn" onClick={() => navigate("/login")}>Get Free Trial <BsFillArrowRightCircleFill className="icon" /></button>
        </div>
        <div data-aos="fade-left" className="featureImg featureImg2">
          <img src={img2} alt="Feature 2" />
        </div>
      </div>
    </div>
  );
};

export default Main;


