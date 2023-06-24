import { BigNumber, providers } from 'ethers';
import { knownInfuraNetworks, getRegistryContractInfo, isValidNetwork } from './helpers';
/**
 * A configuration entry for an ethereum network
 * It should contain at least one of `name` or `chainId` AND one of `provider`, `web3`, or `rpcUrl`
 *
 * @example ```js
 * { name: 'development', rpcUrl: 'http://127.0.0.1:8545/' }
 * { name: 'goerli', chainId: 5, provider: new InfuraProvider('goerli') }
 * { name: 'matic:testnet', chainId: '0x13881', rpcUrl: 'https://matic-mumbai.chainstacklabs.com' }
 * ```
 */
export interface ProviderConfiguration {
    name?: string;
    provider?: providers.Provider;
    rpcUrl?: string;
    chainId?: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    web3?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
  }
  export interface MultiProviderConfiguration extends ProviderConfiguration {
    networks?: ProviderConfiguration[];
  }
  export interface InfuraConfiguration {
    infuraProjectId: string;
  }

  export type ConfigurationOptions = MultiProviderConfiguration | InfuraConfiguration;
export type ConfiguredNetworks = Record<string, providers.Provider>;
function configureNetworksWithInfura(projectId?: string): ConfiguredNetworks {
  if (!projectId) {
    return {};
  }
  const networks: ProviderConfiguration[] = [
    { name: 'mainnet', chainId: '0x1', provider: new providers.InfuraProvider('homestead', projectId) },
    { name: 'goerli', chainId: '0x5', provider: new providers.InfuraProvider('goerli', projectId) },
    { name: 'matic', chainId: '0x89', provider: new providers.InfuraProvider('matic', projectId) },
    { name: 'mumbai', chainId: '0x13881', provider: new providers.InfuraProvider('maticmum', projectId) },
  ];
  return configureNetworks({ networks });
}

export function getProviderForNetwork(conf: ProviderConfiguration): providers.Provider {
    let provider: providers.Provider = conf.provider || conf.web3?.currentProvider;
    if (!provider) {
      if (conf.rpcUrl) {
        const chainIdRaw = conf.chainId ? conf.chainId : knownInfuraNetworks[conf.name || ''];
        const chainId = chainIdRaw ? BigNumber.from(chainIdRaw).toNumber() : chainIdRaw;
        const networkName = knownInfuraNetworks[conf.name || ''] ? conf.name?.replace('mainnet', 'homestead') : 'any';
        provider = new providers.JsonRpcProvider(conf.rpcUrl, chainId || networkName);
      } else {
        throw new Error(`invalid_config: No web3 provider could be determined for network ${conf.name || conf.chainId}`);
      }
    }
    return provider;
  }

  function configureNetwork(net: ProviderConfiguration): ConfiguredNetworks {
    const networks: ConfiguredNetworks = {};
    const chainId = net.chainId || knownInfuraNetworks[net.name || ''];
    if (chainId) {
      if (net.name) {
        networks[net.name] = getProviderForNetwork(net);
      }
      const id = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId;
      networks[id] = getProviderForNetwork(net);
    } else if (net.provider || net.web3 || net.rpcUrl) {
      networks[net.name || ''] = getProviderForNetwork(net);
    }
    return networks;
  }

  function configureNetworks(conf: MultiProviderConfiguration): ConfiguredNetworks {
    return {
      ...configureNetwork(conf),
      ...conf.networks?.reduce<ConfiguredNetworks>((networks, net) => {
        return { ...networks, ...configureNetwork(net) };
      }, {}),
    };
  }

  /**
 * Generates a configuration that maps ethereum network names and chainIDs to the respective web3 providers.
 * @returns a record of providers
 * @param conf configuration options for the resolver. An array of network details.
 * Each network entry should contain at least one of `name` or `chainId` AND one of `provider`, `web3`, or `rpcUrl`
 * For convenience, you can also specify an `infuraProjectId` which will create a mapping for all the networks supported by https://infura.io.
 * @example ```js
 * [
 *   { name: 'development', rpcUrl: 'http://127.0.0.1:8545/' },
 *   { name: 'goerli', chainId: 5, provider: new InfuraProvider('goerli') },
 * ]
 * ```
 */
export function configureResolverWithNetworks(conf: ConfigurationOptions = {}): ConfiguredNetworks {
    const networks = {
      ...configureNetworksWithInfura((conf as InfuraConfiguration).infuraProjectId),
      ...configureNetworks(conf as MultiProviderConfiguration),
    };
    if (Object.keys(networks).length === 0) {
      throw new Error('invalid_config: Please make sure to have at least one network');
    }
    return networks;
  }

  export function getContractInfo(network: string) {
    if (!network && !isValidNetwork(network)) {
      throw new Error('invalid_config: Please make sure to have at correct network name');
    }
    return getRegistryContractInfo(network);
  }