import React from "react";
import "./nfts.css";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const Nfts = ({ title, nfts, loading }) => {
  return (
    <div className="nfts">
      <div className="nfts-container">
        <div className="nfts-container_text">
          {!loading && <h1>{nfts.length < 1 ? "No NFTs Available" : title}</h1>}
        </div>
        <div className="nfts-container_cards">
          {!loading ? (
            nfts.map((nft) => (
              <div className="nft-card">
                <Link to={`/nft/${nft.tokenId}`}>
                  <div className="nft-card_top">
                    <img src={nft.image} alt="" />
                  </div>
                  <div className="nft-card_bottom">
                    <p className="card-title">{nft.name}</p>
                    <p className="card-price">{nft.tokenPrice} CELO</p>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <ClipLoader color={"white"} size={200} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Nfts;
