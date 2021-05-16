import React, { createContext } from 'react';
import Subgraph from '../subgraph';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import {
  useImpermaxSubgraphUrl,
  useWETH,
  useIMX,
  useUniswapV2FactoryAddress
} from '../hooks/useNetwork';

export interface SubgraphContextI {
  subgraph?: Subgraph;
}

export const SubgraphContext = createContext<SubgraphContextI>({});

export const SubgraphProvider: React.FC = ({ children }) => {
  const { chainId = 0 } = useWeb3React<Web3Provider>();
  const impermaxSubgraphUrl = useImpermaxSubgraphUrl();
  const WETH = useWETH();
  const IMX = useIMX();
  const uniswapV2FactoryAddress = useUniswapV2FactoryAddress();

  const subgraph = new Subgraph({
    impermaxSubgraphUrl,
    chainId,
    WETH,
    IMX,
    uniswapV2FactoryAddress
  });

  return (
    <SubgraphContext.Provider
      value={{
        subgraph
      }}>{children}
    </SubgraphContext.Provider>
  );
};
