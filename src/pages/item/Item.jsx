import React, { useEffect, useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useParams } from "react-router";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useNftContract } from "../../hooks/useNftContract";
import { useNavigate } from "react-router-dom";

import "./item.css";

const Item = () => {
  const { id } = useParams();
  const nftContract = useMarketContract();
  const [nftData, setNftData] = useState({});
  const { address, performActions, kit } = useContractKit();
  const { defaultAccount } = kit;

  const navigate = useNavigate();
  useEffect(() => {
    if (nftContract) fetchNft();
  }, [nftContract]);

  const fetchNft = async () => {
    const tokenUri = await nftContract.methods.tokenURI(id).call();
    const meta = await axios.get(tokenUri);
    setNftData(meta.data);
  };

  const purchaseNft = async () => {
    try {
      await performActions(async (kit) => {
        const { defaultAccount } = kit;
        /* user will be prompted to pay the asking proces to complete the transaction */
        const price = ethers.utils
          .parseUnits(nftData.price, "ether")
          .toString();
        console.log({ price });
        const transaction = await nftContract.methods
          .createMarketSale(id)
          .send({
            from: defaultAccount,
            value: price,
          });
        alert(`You have successfully purchased this NFT!`);
        navigate(`/profile`);
      });
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <div className="nft_details">
      <div className="nft_details-img">
        <img src={nftData.image} alt="nft-details-image" />
      </div>
      <div className="nft_details-details">
        <div className="details-title details-row">
          <div className="details-label">Name</div>{" "}
          <div className="details-content">{nftData.name}</div>
        </div>
        <div className="details-description details-row">
          <div className="details-label">Description</div>{" "}
          <div className="details-content">{nftData.description}</div>
        </div>
        <div className="details-price details-row">
          <div className="details-label">Price</div>{" "}
          <div className="details-content">{nftData.price} CELO</div>
        </div>
        <div className="details-bottom">
          {console.log("nftowner -> " + nftData?.owwner)}
          {nftData.owner == defaultAccount ? (
            <div className="details-gift_nft">
              <input type="text" placeholder="to..." /> <span>Gift NFT</span>
            </div>
          ) : (
            <div className="details-buy_btn" onClick={purchaseNft}>
              Buy NFT
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Item;
