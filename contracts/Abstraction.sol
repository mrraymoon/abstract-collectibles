// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Abstraction is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public tokenId;
    Counters.Counter public tokenSold;
    address payable owner;
     uint internal lengthofTokens = 0;

    mapping(uint256 => TokenItem) public tokenItems;

    struct TokenItem {
        uint256 tokenId;
        uint256 tokenPrice;
        address payable seller;
        address payable owner;
        bool sold;
    }

    event CreateTokenItemEvent(
        uint256 tokenId,
        uint256 tokenPrice,
        address indexed seller,
        address indexed owner,
        bool sold
    );
    event MintNewTokenEvent(address indexed minter, uint256 tokenId);
    event BuyTokenEvent(address indexed buyer, uint256 tokenId);
    event GiftTokenEvent(address indexed from, address indexed to, uint256 tokenId);

    constructor() ERC721("Abstraction Collectible", "ABS") {
        owner = payable(msg.sender);
    }

    // mint a new token 
    function mint(string memory _tokenUri, uint256 _tokenPrice) public payable {
        require(_tokenPrice > 0, "invalid token price");// require statement 
        uint256 newId = tokenId.current();
        tokenId.increment();
        _safeMint(msg.sender, newId);
        _setTokenURI(newId, _tokenUri);

        // create token item
        tokenItems[newId] = TokenItem(
            newId,
            _tokenPrice,
            payable(msg.sender),
            payable(address(this)),
            false
        );

        lengthofTokens++;

        // update frontend about new token minted
        emit CreateTokenItemEvent(
            newId,
            _tokenPrice,
            payable(msg.sender),
            payable(address(this)),
            false
        );
        
        // transfer token ownership to contract
        _transfer(msg.sender, address(this), newId);
        emit MintNewTokenEvent(msg.sender, newId);
    }

    // fetch all user's token
    function fetchMyTokens() public view returns (uint256[] memory) {
        uint256 counter;
        uint256 itemsLength = tokenId.current();
        uint256[] memory allMyTokens = new uint256[](balanceOf(msg.sender));

        for (uint256 id = 0; id < itemsLength; id++) {
            if (ownerOf(id) == msg.sender) {
                allMyTokens[counter] = id;
                counter++;
            }
        }
        
        return allMyTokens;
    }

    // fetch all token items
    function fetchAllTokenItems() public view returns (TokenItem[] memory) {
        uint256 counter;
        uint256 totalTokenLength = tokenId.current();
        uint256 tokenBalance = totalTokenLength - tokenSold.current();
        TokenItem[] memory allItems = new TokenItem[](tokenBalance);

        for (uint256 id = 0; id < totalTokenLength; id++) {
            if (!tokenItems[id].sold) {
                allItems[counter] = tokenItems[id];
                counter++;
            }
        }

        return allItems;
    }

    // purchase token
    function purchaseToken(uint256 _tokenId) public payable {
     
        uint256 tokenPrice = tokenItems[_tokenId].tokenPrice;
        require(tokenPrice <= msg.value, "insufficient funds!");
        address payable _seller = payable(tokenItems[_tokenId].seller);
        require(msg.sender != _seller, "you cannot buy your own token");

        tokenItems[_tokenId].seller = payable(address(0));
        tokenItems[_tokenId].owner = payable(msg.sender);
        tokenItems[_tokenId].sold = true;

        _transfer(address(this), msg.sender, _tokenId);        
        tokenSold.increment();    
        _seller.transfer(msg.value);
        emit BuyTokenEvent(msg.sender, _tokenId);
    }

    // sell token 
    function sellToken(uint256 _tokenId, uint256 _newPrice) public {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner!");
        require(_newPrice > 0, "Price too low!");
        tokenItems[_tokenId] = TokenItem(
            _tokenId,
            _newPrice, 
            payable(msg.sender),
            payable(address(this)),
            false
        );
        tokenSold.decrement();

        // update frontend about new token minted
        emit CreateTokenItemEvent(
            _tokenId,
            _newPrice,
            payable(msg.sender),
            payable(address(this)),
            false
        );
        
        // transfer token ownership to contract
        _transfer(msg.sender, address(this), _tokenId);        
    }

    // gift token to another user
    function giftToken(uint256 _tokenId, address _beneficiary) public payable {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner!"); 
        require(_beneficiary != address(0));
        require(msg.sender != address(0));

        transferFrom(msg.sender, _beneficiary, _tokenId);
        emit GiftTokenEvent(msg.sender, _beneficiary, _tokenId);
    }

     function removeToken(uint _index) external {
	         require(ownerOf(_tokenId) == msg.sender, "You are not the owner!");         
            tokenItems[_index]= tokenItems[lengthofTokens - 1];
            delete tokenItems[lengthofTokens - 1];
            lengthofTokens--; 
	 }

      function getTokenslength() public view returns (uint256) {
        return lengthofTokens;
    }

}