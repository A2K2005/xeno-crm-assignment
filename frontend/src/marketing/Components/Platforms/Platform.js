import React, { useEffect } from "react";
import "./Platform.css";
import img1 from "../../img4.1.png";
import { AiFillPlayCircle } from "react-icons/ai";
import Aos from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";

const Platform = () => {
  const navigate = useNavigate();
  useEffect(() => {
    Aos.init({ duration: 2000 });
  }, []);

  return (
    <section className="platformSection" id="Contact">
      <div className="platformContainer">
        <div data-aos="fade-right" className="platformContent">
          <h1>Grow Better with Xeno CRM Today</h1>
          <p>
            With tools to make every part of your process more human and a
            support team excited to help you, getting started with Xeno CRM has
            never been easier.
          </p>
          <div className="buttonSection flex">
            <button className="button" onClick={() => navigate("/login")}>Start Free Trial</button>
            <button className="button btn">
              <AiFillPlayCircle className="icon" /> Watch Demo
            </button>
          </div>
        </div>
        <div data-aos="fade-left" className="platformImg">
          <img src={img1} alt="hero" />
        </div>
      </div>
    </section>
  );
};

export default Platform;


