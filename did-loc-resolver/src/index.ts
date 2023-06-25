'use strict';
import { Contract, providers } from 'ethers';
import {
  DIDDocument,
  DIDResolutionResult,
  DIDResolver,
  ParsedDID,
  parse,
  ServiceEndpoint,
  VerificationMethod,
} from 'did-resolver';
import { ConfigurationOptions, configureResolverWithNetworks, getContractInfo } from './configuration';
import { Errors, identifierMatcher, isValidNetwork, isValidAddress } from './helpers';
import { registryAbi } from './abi';
import axios from 'axios';
// const axios = require('axios')
// import fetch from 'node-fetch';

function checkDdoValidity(ddo: any, subject: string, network: string): boolean {
  let validDdo = true;
  validDdo =
    ddo.hasOwnProperty('@context') &&
    ddo.hasOwnProperty('id') &&
    ddo.hasOwnProperty('verificationMethod') &&
    ddo.hasOwnProperty('authentication') &&
    ddo.hasOwnProperty('assertionMethod');
  if (!validDdo) return false;

  if (ddo['@context'] !== 'https://www.w3.org/ns/did/v1') validDdo = validDdo && false;
  if (ddo.id !== `did:loc:${subject}` && ddo.id !== `did:loc:${network}:${subject}`) validDdo = validDdo && false;
  if (
    ddo.authentication[0] !== `did:loc:${subject}#controller` &&
    ddo.authentication[0] !== `did:loc:${network}:${subject}#controller`
  )
    validDdo = validDdo && false;
  if (
    ddo.assertionMethod[0] !== `did:loc:${subject}#controller` &&
    ddo.assertionMethod[0] !== `did:loc:${network}:${subject}#controller`
  )
    validDdo = validDdo && false;

  return validDdo;
}

export function getResolver(config?: ConfigurationOptions): Record<string, DIDResolver> {
async function resolve(did: string): Promise<DIDResolutionResult> {
  const networks = configureResolverWithNetworks(config);
  // let parsed : ParsedDID |  null;
  const parsedDid: any = parse(did);
  // check if identifier(parsed.id) contains a network code
  const fullId = parsedDid.id.match(identifierMatcher);
  if (!fullId) {
    return {
      didResolutionMetadata: {
        error: Errors.invalidDid,
        message: `Not a valid did:loc: ${parsedDid.id}`,
      },
      didDocumentMetadata: {},
      didDocument: null,
    };
  }
  const ethAddress = fullId[2];

  let err: string | null = null;

  if (!isValidAddress(ethAddress)) {
    err = `resolver_error: Invalid DID address`;
  }

  const networkCode = typeof fullId[1] === 'string' ? fullId[1].slice(0, -1) : '';

  if (!isValidNetwork(networkCode)) {
    err = `resolver_error: Invalid Network name, networkk unsupported`;
  }

  // get provider for that network or the mainnet provider if none other is given
  const provider: providers.Provider = networks[networkCode];
  if (!provider || typeof provider === 'undefined') {
    return {
      didResolutionMetadata: {
        error: Errors.unknownNetwork,
        message: `This resolver is not configured for the ${networkCode} network required by ${
          parsedDid.id
        }. Networks: ${JSON.stringify(Object.keys(networks))}`,
      },
      didDocumentMetadata: {},
      didDocument: null,
    };
  }

  const registry: Contract = new Contract(getContractInfo(networkCode).contractAddress, registryAbi, provider);

  // Calling smart contract with get DID Document
  const ddo: any = await registry.getDID(ethAddress);
  // .then((resValue: any) => {
  //       return resValue;
  // });

  // if(!isIPFS.base32cid(ddo.ddoHash)) {
  //       err = `resolver_error:  DID document invalid!`;
  // }

  const ipfsLink = `https://green-delightful-nightingale-323.mypinata.cloud/ipfs/${ddo}`;
  let didDoc: any = '';
  try {
    const response = await axios.get(ipfsLink);
    console.log('response')
    console.log(response.data)
    didDoc = response.data;
  } catch (error) {
    err = `resolver_error:  DID document not found!`;
  }

  if (!didDoc || didDoc === '') {
    err = `resolver_error:  DID document not found!`;
  }

  const isValidDdo = checkDdoValidity(didDoc, ethAddress, networkCode);

  if (!isValidDdo) {
    err = `resolver_error:  DID document invalid!`;
  }

  const didDocumentMetadata = {};
  let didDocument: DIDDocument | null = null;

//   if (ethAddress) {
//     const chainId = (await provider.getNetwork()).chainId;
//     const blockchainAccountId = `${ethAddress}@eip155:${chainId}`;

//     // setup default did doc
//     didDocument = {
//       id: did,
//       //   service: [
//       //     {
//       //       id: `${did}#Web3PublicProfile-${postfix}`,
//       //       type: 'Web3PublicProfile',
//       //       serviceEndpoint: ethAddress,
//       //     },
//       //   ],
//       verificationMethod: [
//         {
//           id: `${did}#controller`,
//           type: 'EcdsaSecp256k1RecoveryMethod2020',
//           controller: did,
//           blockchainAccountId,
//         },
//       ],
//       authentication: [`${did}#controller`],
//       assertionMethod: [`${did}#controller`],
//     };
//   }

  //     const services = (await getPoiRecord<ServiceEndpoint[]>(poiResolver, 'poi.service')) || []
  //     if (services) {
  //       if (didDocument) {
  //         didDocument.service = [...(didDocument.service || []), ...services].filter(isDefined)
  //       }
  //     }

  const contentType =
    typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json';

  if (err) {
    return {
      didDocument: null,
      didDocumentMetadata,
      didResolutionMetadata: {
        error: Errors.notFound,
        message: err,
      },
    };
  } else {
    return {
      didDocument: didDoc,
      didDocumentMetadata,
      didResolutionMetadata: { contentType },
    };
  }
}

return { loc: resolve }
}