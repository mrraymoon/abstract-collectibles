import React, { useEffect, useState } from "react";
import { Nfts } from "../../components";
import { useNftContract } from "../../hooks/useNftContract";
import axios from "axios";
import { ethers } from "ethers";

const Main = () => {
  const nftContract = useNftContract();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nftContract) loadNFTs();
  }, [nftContract]);
  const loadNFTs = async () => {
    try {
      const data = await nftContract.methods.fetchAllTokenItems().call();      
      const items = await Promise.all(
        data.map(async (_token) => {
          const tokenUri = await nftContract.methods
            .tokenURI(_token.tokenId)
            .call();            
          const meta = await axios.get(tokenUri);
          let tokenPrice = ethers.utils.formatUnits(
            _token.tokenPrice.toString(),
            "ether"
          );
          return {
            tokenId: Number(_token.tokenId),
            tokenPrice,
            seller: _token.seller,
            name: meta.data.itemName,
            description: meta.data.itemDescription,
            owner: _token.owner,
            image: meta.data.itemImage,
          };
        })
      );
      setNfts(items);
      setLoading(false);
    } catch (e) {
      console.log({ e });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <Nfts nfts={nfts} title="All NFTs" loading={loading} />
    </div>
  );
};

export default Main;
