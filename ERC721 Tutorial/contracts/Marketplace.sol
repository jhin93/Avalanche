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

    // The listItem(uint256 tokenId, uint256 price) function:
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

    // The cancelListing(uint256 tokenId) function:
    function cancelListing(uint256 tokenId) public onlyListingAccount(tokenId) /// Here our constraint is that only the address that has listed the item can cancel the listing. 
    { 
        _transfer(address(this), msg.sender, tokenId); // Here we transfer the item from the Marketplace smart contract back to the one who listed it,
        uint256 price = tokenIdToListing[tokenId].price;
        delete claimableByAccount[tokenId]; // Since the mapping claimableByAccount[tokenId] is then cleared via the delete keyword we do not need to check that the item has been listed. 
        delete tokenIdToListing[tokenId];
        delete hasBeenListed[tokenId];
        emit ListingCancelled(tokenId, price, msg.sender); // and emit an event by providing it information about the token id, the price and who cancelled the listing.
    }

    // The buyItem(uint256 tokenId) function:
    function buyItem(uint256 tokenId) public payable { // Here the function takes the token id as a parameter and is a payable function, meaning that the user can send AVAX via it to the smart contract. 
        require(hasBeenListed[tokenId], "The token needs to be listed in order to be bought."); // We then first check whether the item has been listed and whether the msg.value which we send with our function call equals the price of the token.
        require(tokenIdToListing[tokenId].price == msg.value, "You need to pay the correct price."); // If that is the case we split up the msg.value based on the royalty that is defined in the Item. msg.value is another global variable in Solidity:
        
        //split up the price between owner and creator
        uint256 royaltyForCreator = tokenIdToItem[tokenId].royalty.mul(msg.value).div(100); // In the first line we multiply the royalty by the msg.value and then divide it by 100, since we are talking about percentages.
        uint256 remainder = msg.value.sub(royaltyForCreator); // .sub() = SafeMath의 sub 메소드. Meaning that if the buyer pays 10 AVAX for the NFT and the royalty is 20%, 2 AVAX would go to the creator and the remaining 8 AVAX would go to the seller. 
        
        //Afterwards we transfer the NFT from the Marketplace smart contract to the buyer and update the Item by modifying the owner property. 
        //send to creator
        (bool isRoyaltySent, ) = tokenIdToItem[tokenId].creator.call{value: royaltyForCreator}("");
        // .call{보낼 이더}(함수를 호출하는 공간). 
        // 1. 송금만 하는 상황 call{value:보낼 value}(""). 함수호출을 하지 않는다면 뒤의 ("")부분은 비워둔다.
        // 2. 함수 호출만 하는 상황.("")의 ""안에 부르려는 함수를 기재. 이더를 보내지 않는다면 .call("")처럼 {}를 생략한 형태가 될 것.
        // https://www.youtube.com/watch?v=ax5lHvxL9dE 6분 ~ 9분
        // https://medium.com/coinmonks/solidity-transfer-vs-send-vs-call-function-64c92cfc878a
        // (bool sent, bytes memory data) = _to.call.gas(10000){value: msg.value}("");
        require(isRoyaltySent, "Failed to send AVAX");
        //send to owner
        (bool isRemainderSent, ) = tokenIdToItem[tokenId].owner.call{value: remainder}("");
        require(isRemainderSent, "Failed to send AVAX");

        //transfer the token from the smart contract back to the buyer
        _transfer(address(this), msg.sender, tokenId);

        //Modify the owner property of the item to be the buyer
        Item storage item = tokenIdToItem[tokenId];
        item.owner = msg.sender;

        // Finally, as we did before, we clean up the mappings and emit an event passing the necessary information to it.
        //clean up
        delete tokenIdToListing[tokenId];
        delete claimableByAccount[tokenId];
        delete hasBeenListed[tokenId];
        emit ItemBought(tokenId, msg.value, msg.sender);
    }
    function getListing(uint256 tokenId) public view returns (uint256, address)
    { // At the end we define a view function which is used to obtain information about a certain listing. Again, calling this function costs no gas.
        return (tokenIdToListing[tokenId].price, tokenIdToListing[tokenId].owner);
    }

}























