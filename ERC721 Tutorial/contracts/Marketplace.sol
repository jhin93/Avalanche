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
    {
        require(!hasBeenListed[tokenId], "The token can only be listed once");
        _transfer(msg.sender, address(this), tokenId);
        claimableByAccount[tokenId] = msg.sender;
        tokenIdToListing[tokenId] = Listing(
            price,
            msg.sender
        );
        hasBeenListed[tokenId] = true;
        emit ItemListed(tokenId, price, msg.sender);
    }

}























