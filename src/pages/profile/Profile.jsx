import React, { useEffect, useState } from "react";
import "./profile.css";
import Nfts from "../../components/nfts/Nfts";
import { useNftContract } from "../../hooks/useNftContract";
import axios from "axios";
import { ethers } from "ethers";

const Profile = () => {
  const nftContract = useNftContract();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nftContract) {
      getNfts();
    }
  }, [nftContract]);

  // get all user's NFTs from contract
  const getNfts = async () => {
    setLoading(true);
    try {
      const data = await nftContract.methods.fetchMyTokens().call();
      const tokens = await Promise.all(
        data.map(async (_token) => {
          const tokenURI = await nftContract.methods.tokenURI(_token).call();
          let _price = await nftContract.methods.tokenItems(_token).call();
          const owner = await nftContract.methods.ownerOf(_token).call();
          const meta = await axios.get(tokenURI);
          let tokenPrice = ethers.utils.formatUnits(_price.tokenPrice.toString(), "ether");
          return {
            tokenId: Number(_token),
            tokenPrice,
            owner,
            name: meta.data.itemName,
            image: meta.data.itemImage,
            description: meta.data.itemDescription,
          };
        })
      );

      setNfts(tokens);
      console.log(tokens)
    } catch (e) {
      console.log({ e });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile">
      <Nfts nfts={nfts} loading={loading} title="Your NFTs" />
    </div>
  );
};

export default Profile;
