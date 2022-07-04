// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Abstraction is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter public tokenId;
    Counters.Counter public tokenSold;
    address payable owner;

    mapping(uint256 => TokenItem) public tokenItems;
    // keeps track of the largest tokenId owned by a wallet
    mapping(address => uint256) public highestOwned;
    // keeps track of number of tokens owned by a wallet
    mapping(address => uint256) public ownedCounter;
    // keeps track of users that have been suspended
    mapping(address => bool) public suspended;

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
    event GiftTokenEvent(
        address indexed from,
        address indexed to,
        uint256 tokenId
    );

    constructor() ERC721("Abstraction Collectible", "ABS") {
        owner = payable(msg.sender);
    }

    // checks if token exist
    modifier exist(uint256 _tokenId) {
        require(_exists(_tokenId), "Query for non existent token");
        _;
    }

    // checks if caller is suspended
    modifier isSuspended() {
        require(
            !suspended[msg.sender],
            "You have been suspended from the platform"
        );
        _;
    }

    // mint a new token
    function mint(string memory _tokenUri, uint256 _tokenPrice)
        public
        payable
        isSuspended
    {
        require(bytes(_tokenUri).length > 0, "Invalid URI");
        require(_tokenPrice > 0, "Invalid price");
        tokenId.increment();
        uint256 newId = tokenId.current();

        _safeMint(msg.sender, newId);
        _setTokenURI(newId, _tokenUri);

        checkHighestOwned(newId, msg.sender);
        ownedCounter[msg.sender]++;
        // create token item
        tokenItems[newId] = TokenItem(
            newId,
            _tokenPrice,
            payable(msg.sender),
            payable(address(this)),
            false
        );

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

    // checks if purchased/minted/gifted tokenId is larger than the previous registered
    // highestOwned is used in fetchMyTokens for optimization in for loop
    function checkHighestOwned(uint256 _tokenId, address _owner)
        private
        exist(_tokenId)
        isSuspended
    {
        require(_owner != address(0), "Invalid address");
        if (highestOwned[_owner] < _tokenId) {
            highestOwned[_owner] = _tokenId;
        }
    }

    // fetch all user's token
    function fetchMyTokens()
        public
        view
        isSuspended
        returns (uint256[] memory)
    {
        uint256 counter;
        uint256[] memory allMyTokens = new uint256[](ownedCounter[msg.sender]);
        // loop runs till highestOwned is reached since tokenIds above highestOwned
        // won't be owned by caller
        for (uint256 id = 1; id <= highestOwned[msg.sender]; id++) {
            if (
                tokenItems[id].seller == msg.sender || ownerOf(id) == msg.sender
            ) {
                allMyTokens[counter] = id;
                counter++;
            }
        }

        return allMyTokens;
    }

    // fetch all token items
    function fetchAllTokenItems()
        public
        view
        isSuspended
        returns (TokenItem[] memory)
    {
        uint256 counter;
        uint256 totalTokenLength = tokenId.current();
        uint256 tokenBalance = totalTokenLength - tokenSold.current();
        TokenItem[] memory allItems = new TokenItem[](tokenBalance);

        for (uint256 id = 1; id <= totalTokenLength; id++) {
            if (!tokenItems[id].sold) {
                allItems[counter] = tokenItems[id];
                counter++;
            }
        }

        return allItems;
    }

    // purchase token
    function purchaseToken(uint256 _tokenId)
        public
        payable
        exist(_tokenId)
        isSuspended
    {
        uint256 tokenPrice = tokenItems[_tokenId].tokenPrice;
        require(msg.value == tokenPrice, "insufficient funds!");
        require(!tokenItems[_tokenId].sold, "Item isn't on sale");
        require(
            msg.sender != tokenItems[_tokenId].seller,
            "You can't buy your own token"
        );
        address payable _seller = payable(tokenItems[_tokenId].seller);

        tokenItems[_tokenId].seller = payable(address(0));
        tokenItems[_tokenId].owner = payable(msg.sender);
        tokenItems[_tokenId].sold = true;
        tokenItems[_tokenId].tokenPrice = 0;
        ownedCounter[msg.sender]++;
        ownedCounter[_seller]--;
        checkHighestOwned(_tokenId, msg.sender);
        _transfer(address(this), msg.sender, _tokenId);
        tokenSold.increment();
        (bool success, ) = _seller.call{value: tokenPrice}("");
        require(success, "transfer failed");
        emit BuyTokenEvent(msg.sender, _tokenId);
    }

    // sell token
    function sellToken(uint256 _tokenId, uint256 _newPrice)
        public
        exist(_tokenId)
        isSuspended
    {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner!");
        require(_newPrice > 0, "Price too low!");
        require(tokenItems[_tokenId].sold, "Item is already on sale");
        tokenItems[_tokenId] = TokenItem(
            _tokenId,
            _newPrice,
            payable(msg.sender),
            payable(address(this)),
            false
        );

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

    // function used to cancel the sale of a token and return the token to its owner
    function unlistToken(uint256 _tokenId) public exist(_tokenId) isSuspended {
        TokenItem storage currentItem = tokenItems[_tokenId];
        require(currentItem.seller == msg.sender, "Unauthorized user");
        require(!currentItem.sold, "Item isn't on sale");
        currentItem.sold = true;
        currentItem.seller = payable(address(0));
        currentItem.owner = payable(msg.sender);
        currentItem.tokenPrice = 0;
        _transfer(address(this), msg.sender, _tokenId);
    }

    // function to suspend a user from making any transactions on the contract
    function suspendUser(address user) external {
        require(owner == msg.sender, "unathorized user");
        require(user != address(0), "Invalid address");
        require(!suspended[user], "User is already suspended");
        suspended[user] = true;
    }

    // function to unsuspend a user and allow him to resume transactions on the contract
    function unSuspendUser(address user) external {
        require(owner == msg.sender, "unathorized user");
        require(user != address(0), "Invalid address");
        require(suspended[user], "User isn't suspended");
        suspended[user] = false;
    }

    // gift token to another user
    function giftToken(uint256 _tokenId, address _beneficiary)
        public
        payable
        exist(_tokenId)
        isSuspended
    {
        TokenItem storage currentToken = tokenItems[_tokenId];
        require(currentToken.sold, "Token is on sale");
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner!");
        require(_beneficiary != address(0), "Invalid beneficiary");

        require(msg.sender != address(0), "Invalid caller");
        checkHighestOwned(_tokenId, _beneficiary);
        transferFrom(msg.sender, _beneficiary, _tokenId);
        currentToken.seller = payable(address(0));
        currentToken.owner = payable(_beneficiary);
        currentToken.tokenPrice = 0;
        ownedCounter[_beneficiary]++;
        ownedCounter[msg.sender]--;
        emit GiftTokenEvent(msg.sender, _beneficiary, _tokenId);
    }
}
