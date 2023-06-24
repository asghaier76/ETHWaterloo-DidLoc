//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
import "@openzeppelin/contracts/access/Ownable.sol";

/** 
 *@title LocationDidRegistry
 *@dev Smart Contract for Privacy Preserving Location DID Method
 */ 
contract LocationDidRegistry is Ownable {

    // Struct for holding the address of the DOC and hash of DDO
    struct LocationDID {
        address controller;
        string ddoHash;
    }

    // modifier to limit access for some operation to the DID owner only
    modifier onlyController(address _address) {
        require(
            locationDIDs[_address].controller == msg.sender,
            "Operation allowed only for cintroller DID"
        );
        _;
    }

    mapping(address => LocationDID) locationDIDs;

    event DIDRegistered(address indexed _address, string ddo);
    event DIDUpdated(address indexed _address, string ddo);
    event POIAdded(address indexed _address, string ddo);
    event DIDDeleted(address id);
    event TransferOwnership(address _newOwner);

    bool private initialized;

    /**
     *@dev initializes the contract and ownership
     **/

    function initialize() public {
        require(!initialized, "Contract instance has already been initialized");
        initialized = true;
    }

    /**
     *@dev Register a new Location DID
     *@param _address - Contoller Address that will refer the DID doc
     *@param _ddoHash - A string represents the ipfs hash of the stored DDO
     */

    function registerDID(address _address, string memory _ddoHash) external returns (bool) {
        locationDIDs[_address].controller = msg.sender;
        locationDIDs[_address].ddoHash = _ddoHash;

        emit DIDRegistered(_address, _ddoHash);
        return true;
    }

    /**
     *@dev Returns DID Doc IPFS Hash from Chain
     *@param _address - Address of the DID Subject
     */

    function getDID(address _address) public view returns (string memory) {
        return locationDIDs[_address].ddoHash;
    }

    /**
     *@dev To Update the Location DID 
     *@param _address - Address of Subject of DID
     *@param _ddoHash - DID doc IPFS Hash
     */

    function updateDID(address _address, string memory _ddoHash) external onlyController(_address) returns (string memory ddoHash) {
        locationDIDs[_address].ddoHash = _ddoHash;
        emit DIDUpdated(_address, _ddoHash);
        return locationDIDs[_address].ddoHash;
    }

    /**
     *@dev Delete a DID 
     *@param _address - Address of subject of DID doc
     */

    function deleteDID(address _address) external onlyController(_address) returns (bool) {
        delete locationDIDs[_address];
        emit DIDDeleted(_address);
        return true;
    }
}