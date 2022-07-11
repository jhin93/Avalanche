// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";


contract Collectible is ERC721URIStorage {
    mapping(string => bool) public hasBeenMinted;
    mapping(uint256 => Item) public tokenIdToItem;
    struct Item {
        address owner;
        address creator;
        uint256 royalty;
    }
    Item[] private items;
    event ItemMinted(uint256 tokenId, address creator, string metadata, uint256 royalty);
    
    constructor() ERC721("NFTCollectible", "NFTC") {}
}


