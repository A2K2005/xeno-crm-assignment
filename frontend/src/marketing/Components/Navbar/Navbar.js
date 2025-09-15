import React, { useState } from "react";
import "./Navbar.css";

import { AiOutlineAlignRight } from "react-icons/ai";
import { GrClose } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/xeno.svg";

const Navbar = () => {
  const [active, setActive] = useState("navBar");
  const navigate = useNavigate();

  const openNavbar = () => {
    setActive("navBar activeNavbar");
  };

  const closeNavbar = () => {
    setActive("navBar");
  };

  return (
    <section className="navbarSection">
      <div className="header flex">
        <div className="logoDiv">
          <a href="#logo" className="logo">
            <img src={logo} alt="Xeno" />
          </a>
        </div>

        <div className={active}>
          <ul className="navList flex">
            <li className="navItems">
              <a href="#Features" className="nav-anchor">
                Features
              </a>
            </li>
            <li className="navItems">
              <a href="#About" className="nav-anchor">
                About
              </a>
            </li>
            <li className="navItems">
              <a href="#Pricing" className="nav-anchor">
                Pricing
              </a>
            </li>
            <li className="navItems">
              <a href="#Resources" className="nav-anchor">
                Resources
              </a>
            </li>
            <li className="navItems">
              <a href="#Contact" className="nav-anchor">
                Contact
              </a>
            </li>

            <button className="button" onClick={() => navigate("/login")}>Start Free Trial</button>
          </ul>

          <div onClick={closeNavbar} className="closeNavbar">
            <GrClose className="icon" />
          </div>
        </div>

        <div onClick={openNavbar} className="toggleNavbar">
          <AiOutlineAlignRight className="icon" />
        </div>
      </div>
    </section>
  );
};

export default Navbar;


