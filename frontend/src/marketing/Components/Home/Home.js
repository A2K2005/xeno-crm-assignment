import React, { useEffect } from "react";
import "./Home.css";
import { AiFillPlayCircle } from "react-icons/ai";
import img1 from "../../img1.webp";
import { useNavigate } from "react-router-dom";

import Aos from "aos";
import "aos/dist/aos.css";

const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    Aos.init({ duration: 2000 });
  }, []);

  return (
    <section className="homeSection" id="About">
      <div className="homeContainer">
        <div className="homeContent" data-aos="fade-up">
          <h1>
            The Ultimate CRM
            <br />
            Platform for your Business.
          </h1>
          <p>
            Meet Xeno CRM — powerful, not overpowering. Connect your data, teams, and
            customers on one platform that grows with your business.
          </p>
          <div className="buttonSection flex">
            <button className="button" onClick={() => navigate("/login")}>Start Free Trial</button>
            <button className="button btn">
              <AiFillPlayCircle className="icon" /> Watch Demo
            </button>
          </div>
        </div>
        <div data-aos="fade-left" className="homeImg">
          <img src={img1} alt="hero" />
        </div>
      </div>
    </section>
  );
};

export default Home;


