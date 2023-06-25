export const identifierMatcher = /^(.*:)?(0x[0-9a-fA-F]{40})$/;
export const nullAddress = '0x0000000000000000000000000000000000000000';
export const DEFAULT_JSON_RPC = 'http://127.0.0.1:8545/';
export const knownInfuraNetworks: Record<string, string> = {
  mainnet: '0x1',
  goerli: '0x5',
  matic: '0x89',
  mumbai: '0x13881',
};

const registryConfig: Record<string, any> = {
    goerli: {
      rpcUrl: 'https://goerli.infura.io/v3/',
      contractAddress: '0xdE86C611a89E52e5CE349D77bD8f1Dd7452692d2',
      NETWORK_ID: '0x5',
    },
    mainnet: {
      rpcUrl: 'https://mainnet.infura.io/v3/',
      contractAddress: '',
      NETWORK_ID: '0x1',
    },
    mumbai: {
      rpcUrl: 'https://polygon-mumbai.infura.io/v3/',
      contractAddress: '0x3161665c00d107Ddbdc8A440C5DfC7B81DC182BD',
      NETWORK_ID: '0x13881',
    },
    matic: {
      rpcUrl: 'https://polygon-matic.infura.io/v3/',
      contractAddress: '',
      NETWORK_ID: '0x89',
    },
  };

  export function isValidAddress(address: string) {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }
  export function isValidNetwork(network: string) {
    network = network === '' ? 'mainnet' : network;
    return knownInfuraNetworks.hasOwnProperty(network);
  }
  export function getRegistryContractInfo(network: string) {
    return registryConfig[network];
  }

  export enum Errors {
    /**
     * The resolver has failed to construct the DID document.
     * This can be caused by a network issue, a wrong registry address or malformed logs while parsing the registry history.
     * Please inspect the `DIDResolutionMetadata.message` to debug further.
     */
    notFound = 'notFound',
    /**
     * The resolver does not know how to resolve the given DID. Most likely it is not a `did:loc`.
     */
    invalidDid = 'invalidDid',
    /**
     * The resolver is misconfigured or is being asked to resolve a DID anchored on an unknown network
     */
    unknownNetwork = 'unknownNetwork',
  }
  export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
    return arg && typeof arg !== 'undefined';
  }