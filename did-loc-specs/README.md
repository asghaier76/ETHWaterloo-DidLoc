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

### Identifier Controller
By default, each identifier is controlled by itself, and each identifier can only be controlled by a single account at any given time. The controller is the address corresponding to the private key that is supposed to be used to submit all transactions against the registry contract for performing operations of DID Register, Update and Delete and it is expected that the controller account should have enough balance to pay for gas fees transactions on the targeted network.

## CRUD Operation Definitions
### Create (Register)
In order to create a `loc` DID, first an Ethereum address, i.e., public/private key pair, needs to be either generated or be held by the user in a wallet of choice. At this step, there has been no interaction with the registry contract on the targeted EVM network. The registration operation happens at the time the controller, which is the same the DID identifier, issues the register command to the registry smart contract.
The client side should first generate the DID Doc based on the format described in this DID method document, the client will submit the DID document and store it on IFPS network and obtain the CID v1. Then the client will invoke the register DID function on the registry smart contract by passing the identifier (controller address) and the ipfs hash.
The default DID document for an `did:loc<Ethereum address>` on mainnet, e.g. `did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141` will look like this:
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141",
  "verificationMethod": [
    {
      "id": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#controller",
      "type": "EcdsaSecp256k1RecoveryMethod2020",
      "controller": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141",
      "blockchainAccountId": "eip155:1:0x91597CDbfEF4F72Bc18E98C60f723599b1962141"
    }
  ],
  "authentication": ["did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#controller"],
  "assertionMethod": ["did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#controller"]
}
```

### Read (Resolve)
Resolving a DID implies the act of fetching the DID doc registered on chain. The resolver when queried with a DID returns the associated DID doc. A query is sent out to fetch the registered DID record from the chain which if successful will contain the ipfs hash of the DID doc, which can then be retrieved from the IPFS network that will contain the entire DID doc content.

### Update 
The basic update operation involves updating the ipfs hash of the DID doc on chain, which will be a different DID doc that has been stored on IPFS. So the process will start with the client generating the new version of the DID doc, uploading it to IPFS and obtaining the ipfs hash. Then the client invokes the update function on the regitry contract to update the DID doc ipfs hash on chain. The update operation is guraded so that only the controller is able to perform that. The motivation behind using the approach of storing the DID doc JSON object on IPFS and anchoring that on-chain using the IPFS hash is to make the gas usage almost identical for different update operations, such as adding an authoirzation key, a veirifcation method or a point of interest.

The most improtant update operation is the process of adding a service endpoint, which in did:loc method represents the process of adding a new mapping of a POI in the DID doc. The foramtting for adding a service point is based on the following:
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141",
  "verificationMethod": [
    {
      "id": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#controller",
      "type": "EcdsaSecp256k1RecoveryMethod2020",
      "controller": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141",
      "blockchainAccountId": "eip155:1:0x91597CDbfEF4F72Bc18E98C60f723599b1962141"
    }
  ],
  "authentication": ["did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#controller"],
  "assertionMethod": ["did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#controller"],
  "service": [{
    "id": "did:loc:0x91597CDbfEF4F72Bc18E98C60f723599b1962141#poi2",
    "type": "PointOfInterest",
        "homomorphicScheme": "paillier",
        "publicKey": {
            "n": "161942003092727024729940643423892518719734535475906214886415006453054027938509788881836820057219155705764868406946789063388792703886592953702361677095663329274148205007962426131927943275586699046057318903735723017809023333627009453733400271369020199023962661807917079834869851507619394275378575039106923517147n",
            "g": "23688197298216943516510038320994209492722280219639890470188123289407199254316846950778734769648565262510361992118721665148624845900870781188625361907387058599024343540017801958801852787768931611732763822093651831233880488561902303988683946658662455017264695319105904179739446223059332026677656891024863865211020741904557940430671344629045394119253214654660872907574113990073382027283515571739684871247554886786639471982534050354287271830138416012354978231295179336971527290091010015528914151811564252805090530679113237660570158797067530495336529073377141119442208411712190734916268573919110856442805760428514191686979n"
        },
    "serviceEndpoint": {
      "xyFactor" : "Enc(x^2 + y^2)",
      "xFactor" : "Enc(-2*x)",
      "yFactor" : "Enc(-2*y)",
      "radius" : "r"
    }
}
```
The formating for any added service endpoint with type `PointOfInterest` should be either the JSON object of the POI or a dweb link for the ipfs hash CID v1 if stored on IPFS.
```
BASE_URL+DID_IDENTIFIER+POI_INDEX 
```
In case of using IPFS for storing the POI details then the recommended option is to use CIDv1 representation.

### Delete(Deactivate)
The controller of DID doc holds the authority to delete the DID doc from being available on chain, while the DID doc as a JSON object still lives on IPFS, but the source of truth is the on-chain data.

## Point Of Interest Format and Calculation
As mentioned, the main motivation behind this method is to ensure capability of sharing wallet related location information but while still maintaining wallet holder privacy. To ensure that, homoprohic encryption techniques are used to encrypt the location information store it as POIs in public ledger and enable communication between two entities to verify locations and prove proximity or a POI being in a geofenced area. One of the suggested approach for the homomorphic encryption and operatiosn is based on the [Paillier cryptosystem](https://link.springer.com/content/pdf/10.1007/3-540-48910-X_16.pdf).
Any POI is represented as a 4-tuple made of the encrypted value of calculating the user location coordinates ``` (x, y) ``` as in  
```math
 Enc(x^2 + y^2) , Enc(-2*x) , Enc(-2*y) , r  
```
where the encryption is made by the DID controller homomorphoic public key specified in the service section. 
In terms of storing, the POI is stored as a JSON document using the following format.
```json
{
  "xyFactor" : "Enc(x^2 + y^2)",
  "xFactor" : "Enc(-2*x)",
  "yFactor" : "Enc(-2*y)",
  "radius" : "r"
}
```
For any interested party in a wallet POIs and its location and proximity, an entity can first resolve the DID doc of the wallet address which will provide the DID doc with a list of services endpoints. By filtering for only service endpoints of type `PointOfInterest`, the inqurying entity can find a list of POIs and the endpoints to those POIs which each will resolve to a POI JSON object that includes the different homomorphic encrypted values of that POI coordinates.
As the entity obtains the POI object, the following calculations will need to be performed 
- First the entity will compare the radius value `r` to its intention, if the radius value is too large or too small. For example, an entity that want to check certain wallet proximity in a conference won't be interested in POI that has r set to 100's of meters or more. Also, an entity that want to send a geofenced advertisement to a wallet won't be interested in a POI with a radius value of few meters.
- The inquiring the entity will calculate using the controller public key the following encrypted values: ``` Enc(u^2 + v^2), where (u , v) ``` is the center of the inquiring entity circle of geofenced area for example. The inquiring entity also need to calculate ``` (Enc(-2*x))^u and (Enc(-2*y))^v ```.
- The inquiring entity finally, calculates
```math
Enc(d) = ( Enc(x^2 + y^2) * Enc(u^2 + v^2) ) * ( (Enc(-2*x))^u * (Enc(-2*y))^v )
```
this will represent the distance d encrypted using the controller homomorphic scheme public key.
- The inquiring entity communicates the last value to the wallet of the controller and then the controller wallet using the private key can decrypt and find the value d. If d is less than r, then the associated action is performed, e.g., send a location-based notification to the 2nd party wallet or start a wallet to wallet chat.