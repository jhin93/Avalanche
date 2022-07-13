// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import './Collectible.sol';

// 설명.
// https://docs.avax.network/community/tutorials-contest/avalanche-erc721-tutorial#writing-our-first-erc721-contract

contract Marketplace is Collectible {
    using SafeMath for uint256;

    struct Listing {
        uint256 price;
        address owner;
    }
    mapping (uint256 => Listing) public tokenIdToListing;
    mapping (uint256 => bool) public hasBeenListed;
    mapping (uint256 => address) public claimableByAccount;
    event ItemListed(uint256 tokenId, uint256 price, address seller);
    event ListingCancelled(uint256 tokenId, uint256 price, address seller);
    event ItemBought(uint256 tokenId, uint256 price, address buyer);

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            msg.sender == ownerOf(tokenId),
            "Only the owner of the token id can call this function."
        );
        _;
    }

    modifier onlyListingAccount(uint256 tokenId) {
        require(
            msg.sender == claimableByAccount[tokenId],
            "Only the address that has listed the token can cancel the listing."
        );
        _;
    }

    function listItem(uint256 tokenId, uint256 price) public onlyTokenOwner(tokenId) 
    {   // The function takes two parameters, namely the token id and the price. 
        require(!hasBeenListed[tokenId], "The token can only be listed once"); // We begin by defining the constraints which are that only the token owner can list the NFT and that this NFT has not been listed already.
        _transfer(msg.sender, address(this), tokenId); // Then we proceed by using the _transfer(msg.sender, address(this), tokenId) function, which is provided by the ERC721.sol contract, and we transfer the token to the Marketplace.sol contract.
        claimableByAccount[tokenId] = msg.sender; // Then we specify the msg.sender as the address that can cancel the listing and we update the mappings accordingly by creating a new Listing
        tokenIdToListing[tokenId] = Listing(
            price,
            msg.sender
        );
        hasBeenListed[tokenId] = true; // and by specifying that the token id has been listed.
        emit ItemListed(tokenId, price, msg.sender); // At the end, as usual, we emit an event.
    }

}























