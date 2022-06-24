import React, { useEffect, useState } from "react";
import "./profile.css";
import Nfts from "../../components/nfts/Nfts";
import { useContractKit } from "@celo-tools/use-contractkit";
import { useNftContract } from "../../hooks/useNftContract";
import axios from "axios";
import { ethers } from "ethers";

const Profile = () => {
  const { address, connect, performActions } = useContractKit();
  const nftContract = useNftContract();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nftContract) {
      loadNFTs();
    }
  }, [nftContract]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const data = await nftContract.methods.fetchMyNFTs().call();
      console.log({ data });
      const items = await Promise.all(
        data.map(async (i) => {
          const tokenURI = await nftContract.methods.tokenURI(i.tokenId).call();
          const owner = await nftContract.methods.getNftOwner(i.tokenId).call();
          const meta = await axios.get(tokenURI);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          return {
            price,
            tokenId: Number(i.tokenId),
            seller: i.seller,
            name: meta.data.name,
            owner,
            image: meta.data.image,
            tokenURI,
          };
        })
      );

      setNfts(items);
    } catch (e) {
      console.log({ e });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile">
      <Nfts
          nfts={nfts}
          loading={loading}
          title="Your NFTs"      
        />
    </div>
  );
};

export default Profile;
