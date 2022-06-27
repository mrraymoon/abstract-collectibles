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
  const [tokenOwner, setTokenOwner] = useState();
  const [beneficiary, setBeneficiary] = useState();
  const nftContract = useNftContract();
  const [nftDetails, setNftDetails] = useState({});
  const { address, performActions, kit } = useContractKit();
  const { defaultAccount } = kit;

  const navigate = useNavigate();
  useEffect(() => {
    if (nftContract) fetchNftData();
  }, [nftContract]);

  const fetchNftData = async () => {
    const tokenUri = await nftContract.methods.tokenURI(id).call();
    const _tokenOwner = await nftContract.methods.ownerOf(id).call();
    const meta = await axios.get(tokenUri);
    setNftDetails(meta.data);
    setTokenOwner(_tokenOwner);
  };

  // purchase an NFT
  const purchaseNft = async () => {
    try {
      await performActions(async (kit) => {
        const { defaultAccount } = kit;
        const price = ethers.utils
          .parseUnits(nftDetails.itemPrice, "ether")
          .toString();
        const transaction = await nftContract.methods.purchaseToken(id).send({
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

  // sell an NFT
  const sellNft = async () => {
    try {
      await performActions(async (kit) => {
        const _price = ethers.utils
          .parseUnits(nftDetails.itemPrice, "ether")
          .toString();
        await nftContract.methods
          .sellToken(id, _price)
          .send({ from: defaultAccount });
        alert(`You have successfully sold an NFT!`);
        navigate(`/`);
      });
    } catch (e) {
      console.log("Error while trying to sell NFT: " + e);
    }
  };

  // gift and NFT to another user
  const giftNft = async () => {
    if (!beneficiary) {
      alert("Please enter a valid address");
      return;
    }
    try {
      await performActions(async (kit) => {
        await nftContract.methods
          .giftToken(id, beneficiary)
          .send({ from: defaultAccount });
      });
    } catch (e) {
      console.log("Error while trying to gift NFT: " + e);
    }
  };

  return (
    <div className="nft_details">
      <div className="nft_details-img">
        <img src={nftDetails.itemImage} alt="nft-details-image" />
      </div>
      <div className="nft_details-details">
        <div className="details-title details-row">
          <div className="details-label">Name</div>{" "}
          <div className="details-content">{nftDetails.itemName}</div>
        </div>
        <div className="details-description details-row">
          <div className="details-label">Description</div>{" "}
          <div className="details-content">{nftDetails.itemDescription}</div>
        </div>
        <div className="details-price details-row">
          <div className="details-label">Price</div>{" "}
          <div className="details-content">{nftDetails.itemPrice} CELO</div>
        </div>
        <div className="details-bottom">
          {tokenOwner == defaultAccount ? (
            <>
              <div className="details-buy_btn" onClick={() => sellNft()}>
                Sell NFT
              </div>
              <div className="details-gift_nft">
                <input
                  type="text"
                  placeholder="to..."
                  onChange={(e) => setBeneficiary(e.target.value)}
                />{" "}
                <span onClick={() => giftNft()}>Gift NFT</span>
              </div>
            </>
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
