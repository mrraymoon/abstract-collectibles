import React from "react";
import "./footer.css";
import image from "../../assets/image.jpg";
const Footer = () => {
  return (
    <div className="footer section__padding">
      <img src={image} alt="logo" />
      <p>Collect your abstract NFTs</p>
    </div>
  );
};

export default Footer;
