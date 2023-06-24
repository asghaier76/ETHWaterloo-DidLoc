# Privacy Preserving Location DID loc-DID Method Specification
## Preface 
The privacy preserving location DID (did-loc) method specification is complaint with the [DID requirements](https://www.w3.org/TR/did-core/#ref-for-dfn-did-documents-3) specified by W3C Credentials Community Group. For a detailed read on DID and other DID method specifications check the [W3C specs](https://www.w3.org/TR/did-core/)
# Motivation
Location sharing and applications requiring geofencing and handling events related to wallets proximity is very limited in distributed ledgers because of the nature of DLT and the fact that all data is available and public on chain. However, the demand is clear for such functionalities to enable users to associate locations and points of interest POIs to their wallets but without sacrificing their privacy and allowing the location information to be accessible to any one. 
To resolve this, the adopted approach by this method relies on the use of homomorphic encryptions. Homomorphic encryptions allow an entity to share sensitive information in encrypted format with another party that can perform certain operations on the encrypted and return it to the first party that upon decryption can see the exact result for the original information.
In location-based applications, most of the use cases revolve around entities being able to share their locations with each other to perform calculations related to proximity and geofencing. The use of homomorphic encryption is applied for geofencing and proximity calculations, where few protocols exist that allow one entity to share its location with another entity that can perform some calculations and with data exchange with the first entity can both identify if they are in proximity of each other without exposing the actual location information.
For this purpose, loc-did provides a decentralized method based on the concept of DID to enable users to associate their wallet addresses with different POIs/locations without sharing the actual location information, yet allowing other parties based on some agreement after exchange of messages to establish if these registered POIs are in proximity of their locations or their own POIs. 
## Abstract 
The Location DID method allows any Ethereum key pair account to create an identity and associate with that identity different geo locations / points of interest, either physical or virtual, in a privacy preserving way. For handling all CRUD operations of the DID Document, the loc-did registry is represented by a smart contract that is deployed on polygon testnet and mainnet, please see [registry-contract](ttps://github.com/asghaier76/location-did-method/tree/master/loc-did-registry)

## Targeted Environment
While initially The did-loc-registry smart contract is going to be deployed on Polygon (mainnet and testnet), the aim is to have this deployed on other chains to not limit the choice of users, yet that will be achieved in the next phase after enabling cross-chain assets synchronization.

## DID Method Name
The namestring that shall identify this DID method is: loc
A DID that uses this method MUST begin with the following prefix: did:loc. Per the DID specification, this string MUST be in lowercase. The remainder of the DID is the Method Specific Identifier MSI, which is defined as an ethereum address.

A DID that uses this method MUST begin with the following prefix: did:loc. Per the DID specification, this string MUST be in lowercase. The remainder of the DID is the Method Specific Identifier MSI, which is defined as an ethereum address.

## DID Method Specific Identifier
The method specific identifier is represented as the HEX-encoded secp256k1 public key (in compressed form), or the corresponding HEX-encoded Ethereum address on the target network, prefixed with `0x`.
    loc-did = "did:loc:" loc-specific-identifier
    loc-specific-identifier = [ evm-network ":" ] ethereum-address
    evm-network = mainnet | goerli | matic | mumbai
    ethereum-address = "0x" 40*HEXDIG
The `ethereum-address` are case-insensitive. It is assumed that the DID is anchored on the Ethereum mainnet by default. This means the following DIDs will resolve to the same equivalent DID Documents:
    did:loc:mainnet:0x91597CDbfEF4F72Bc18E98C60f723599b1962141
    did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141
For the polygon did-loc representation, the MSI (Method Specific Identifier) is an ethereum address, prefixed with the chain name for Polygon mainnet or testnet, `matic` or `mumbai` respectively.

