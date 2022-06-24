import React, { useState } from "react";
import image from "../../assets/image.jpg"
import { Link } from "react-router-dom";
import { useContractKit } from "@celo-tools/use-contractkit";
import { truncateAddress } from "../../utils/helpers";

import "./Navbar.css";

const Menu = () => (
  <>
    <Link to="/">
      <p>Explore</p>{" "}
    </Link>
    <Link to="/profile">
      {" "}
      <p>Profile</p>
    </Link>
  </>
);

const Navbar = () => {
  const { address, destroy, connect } = useContractKit();

  return (
    <div className="navbar">
      <div className="navbar-links">
        <div className="navbar-links_logo">
          <img src={image} alt="logo" />
          <Link to="/">
            <h1>Abstraction</h1>
          </Link>
        </div>
        <div className="navbar-links_container">
          <Menu />
          {address && (
            <Link to="/">
              <p onClick={destroy}>Logout</p>
            </Link>
          )}
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div className="navbar-sign">
        {!address ? (
          <>
            <button type="button" className="secondary-btn" onClick={connect}>
              Connect wallet
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={destroy} className="secondary-btn">
              {truncateAddress(address)}
            </button>

            <Link to="/create">
              <button type="button" className="primary-btn">
                Mint new NFT
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
