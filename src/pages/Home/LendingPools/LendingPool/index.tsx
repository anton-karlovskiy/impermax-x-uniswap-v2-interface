
import { Link } from 'react-router-dom';
import clsx from 'clsx';
// ray test touch <<
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
// ray test touch >>

import LendingPoolDesktopGridWrapper from './LendingPoolDesktopGridWrapper';
import LendingPoolMobileGridWrapper from './LendingPoolMobileGridWrapper';
import Panel from 'components/Panel';
import ImpermaxImage from 'components/UI/ImpermaxImage';
import {
  // ray test touch <<
  // useBorrowAPY,
  // useSupplyAPY,
  // useTotalBorrowsUSD,
  // useSupplyUSD,
  // useSymbol,
  // useFarmingAPY,
  // ray test touch >>
  useUniswapAPY
} from 'hooks/useData';
import { useTokenIcon } from 'hooks/useUrlGenerator';
import {
  formatUSD,
  formatPercentage
} from 'utils/format';
import useLendingPoolURL from 'hooks/use-lending-pool-url';
// ray test touch <<
import toAPY from 'services/to-apy';
import { WETH_ADDRESSES } from 'config/web3/contracts/weth';
import getPairAddress from 'services/get-pair-address';
import { IMX_ADDRESSES } from 'config/web3/contracts/imx';
import {
  Address,
  PoolTokenType,
  LendingPoolData
} from 'impermax-router/interfaces';
// ray test touch >>

const LEVERAGE = 5;

interface PairCellCustomProps {
  tokenIconA: string;
  tokenIconB: string;
  symbolA: string;
  symbolB: string;
}

const TokenPairLabel = ({
  tokenIconA,
  tokenIconB,
  symbolA,
  symbolB,
  className
}: PairCellCustomProps & React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'flex',
      'flex-shrink-0',
      'items-center',
      '-space-x-1.5',
      className
    )}>
    <ImpermaxImage
      width={32}
      height={32}
      // TODO: could componentize
      className={clsx(
        'inline-block',
        'rounded-full',
        'ring-2',
        'ring-white'
      )}
      src={tokenIconA}
      alt='' />
    <ImpermaxImage
      width={32}
      height={32}
      className={clsx(
        'inline-block',
        'rounded-full',
        'ring-2',
        'ring-white'
      )}
      src={tokenIconB}
      alt='' />
    <span
      className={clsx(
        'font-medium',
        'text-textSecondary',
        '!ml-1.5'
      )}>
      {symbolA}/{symbolB}
    </span>
  </div>
);

interface TokenLabelProps {
  tokenIcon: string;
  symbol: string;
}

const TokenLabel = ({
  tokenIcon,
  symbol
}: TokenLabelProps): JSX.Element => (
  <div
    className={clsx(
      'flex',
      'flex-shrink-0',
      'items-center',
      'space-x-1.5'
    )}>
    <ImpermaxImage
      width={20}
      height={20}
      className={clsx(
        'inline-block',
        'rounded-full',
        'ring-2',
        'ring-white'
      )}
      src={tokenIcon}
      alt='' />
    <span
      className={clsx(
        'font-medium',
        'text-textSecondary'
      )}>
      {symbol}
    </span>
  </div>
);

const PropertyLabel = ({
  className,
  children,
  ...rest
}: React.ComponentPropsWithRef<'h5'>) => (
  <h5
    className={clsx(
      'text-textSecondary',
      'font-medium',
      'text-sm',
      className
    )}
    {...rest}>
    {children}
  </h5>
);

const Value = (props: React.ComponentPropsWithRef<'span'>): JSX.Element => (
  <span {...props} />
);

const SetWrapper = ({
  className,
  children
}: React.ComponentPropsWithRef<'div'>) => (
  <div
    className={clsx(
      'flex',
      'flex-col',
      'space-y-1',
      className
    )}>
    {children}
  </div>
);

interface Props {
  // ray test touch <<
  chainID: number;
  lendingPoolsData: { [key in Address]: LendingPoolData };
  // TODO: should type properly
  lendingPool: any;
  // ray test touch >>
  greaterThanMd: boolean;
}

// ray test touch <<
const useLendingPoolSymbol = (
  // TODO: should type properly
  lendingPool: any,
  poolTokenType: PoolTokenType.BorrowableA | PoolTokenType.BorrowableB
): string => {
  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }

  const underlying = lendingPool[poolTokenType].underlying;
  const wethAddress = WETH_ADDRESSES[chainId];
  let symbol;
  if (underlying.id === wethAddress.toLowerCase()) {
    symbol = 'ETH';
  } else {
    symbol = underlying.symbol;
  }

  return symbol;
};

const getLendingPoolSupplyUSD = (
  // TODO: should type properly
  lendingPool: any,
  poolTokenType: PoolTokenType.BorrowableA | PoolTokenType.BorrowableB
): number => {
  const totalBalance = parseFloat(lendingPool[poolTokenType].totalBalance);
  const totalBorrows = parseFloat(lendingPool[poolTokenType].totalBorrows);
  const supply = totalBalance + totalBorrows;
  const utilizationRate = supply === 0 ? 0 : totalBorrows / supply;

  const borrowRate = parseFloat(lendingPool[poolTokenType].borrowRate);
  const reserveFactor = parseFloat(lendingPool[poolTokenType].reserveFactor);
  const supplyRate = borrowRate * utilizationRate * (1 - reserveFactor);

  const accrualTimestamp = parseFloat(lendingPool[poolTokenType].accrualTimestamp);
  const currentSupply = supply * (1 + (Date.now() / 1000 - accrualTimestamp) * supplyRate);
  const tokenPrice = parseFloat(lendingPool[poolTokenType].underlying.derivedUSD);
  const supplyUSD = currentSupply * tokenPrice;

  return supplyUSD;
};

const getLendingPoolTotalBorrowsUSD = (
  // TODO: should type properly
  lendingPool: any,
  poolTokenType: PoolTokenType.BorrowableA | PoolTokenType.BorrowableB
): number => {
  const totalBorrows = parseFloat(lendingPool[poolTokenType].totalBorrows);
  const accrualTimestamp = parseFloat(lendingPool[poolTokenType].accrualTimestamp);
  const borrowRate = parseFloat(lendingPool[poolTokenType].borrowRate);
  const currentTotalBorrows = totalBorrows * (1 + (Date.now() / 1000 - accrualTimestamp) * borrowRate);
  const tokenPrice = parseFloat(lendingPool[poolTokenType].underlying.derivedUSD);
  const totalBorrowsUSD = currentTotalBorrows * tokenPrice;

  return totalBorrowsUSD;
};

const getLendingPoolSupplyAPY = (
  // TODO: should type properly
  lendingPool: any,
  poolTokenType: PoolTokenType.BorrowableA | PoolTokenType.BorrowableB
): number => {
  const totalBalance = parseFloat(lendingPool[poolTokenType].totalBalance);
  const totalBorrows = parseFloat(lendingPool[poolTokenType].totalBorrows);
  const supply = totalBalance + totalBorrows;
  const utilizationRate = supply === 0 ? 0 : totalBorrows / supply;

  const borrowRate = parseFloat(lendingPool[poolTokenType].borrowRate);
  const reserveFactor = parseFloat(lendingPool[poolTokenType].reserveFactor);
  const supplyRate = borrowRate * utilizationRate * (1 - reserveFactor);

  const supplyAPY = toAPY(supplyRate);

  return supplyAPY;
};

const getLendingPoolBorrowAPY = (
  // TODO: should type properly
  lendingPool: any,
  poolTokenType: PoolTokenType.BorrowableA | PoolTokenType.BorrowableB
): number => {
  const borrowRate = parseFloat(lendingPool[poolTokenType].borrowRate);
  const borrowAPY = toAPY(borrowRate);

  return borrowAPY;
};
// ray test touch >>

const LendingPool = ({
  // ray test touch <<
  chainID,
  lendingPoolsData,
  lendingPool,
  // ray test touch >>
  greaterThanMd
}: Props): JSX.Element => {
  // ray test touch <<
  const symbolA = useLendingPoolSymbol(lendingPool, PoolTokenType.BorrowableA);
  const symbolB = useLendingPoolSymbol(lendingPool, PoolTokenType.BorrowableB);
  const supplyUSDA = getLendingPoolSupplyUSD(lendingPool, PoolTokenType.BorrowableA);
  const supplyUSDB = getLendingPoolSupplyUSD(lendingPool, PoolTokenType.BorrowableB);
  const totalBorrowsUSDA = getLendingPoolTotalBorrowsUSD(lendingPool, PoolTokenType.BorrowableA);
  const totalBorrowsUSDB = getLendingPoolTotalBorrowsUSD(lendingPool, PoolTokenType.BorrowableB);
  const supplyAPYA = getLendingPoolSupplyAPY(lendingPool, PoolTokenType.BorrowableA);
  const supplyAPYB = getLendingPoolSupplyAPY(lendingPool, PoolTokenType.BorrowableB);
  const borrowAPYA = getLendingPoolBorrowAPY(lendingPool, PoolTokenType.BorrowableA);
  const borrowAPYB = getLendingPoolBorrowAPY(lendingPool, PoolTokenType.BorrowableB);

  const imxAddress = IMX_ADDRESSES[chainID];
  const wethAddress = WETH_ADDRESSES[chainID];
  const imxPair = getPairAddress(wethAddress, imxAddress, chainID).toLowerCase();
  const aAddress = lendingPoolsData[imxPair][PoolTokenType.BorrowableA].underlying.id;
  const poolTokenType =
    aAddress.toLowerCase() === imxAddress.toLowerCase() ?
      PoolTokenType.BorrowableA :
      PoolTokenType.BorrowableB;
  const imxLendingPoolData = lendingPoolsData[imxPair];
  const imxPrice = Number(imxLendingPoolData[poolTokenType].underlying.derivedUSD);

  let rewardSpeed;
  const lendingPoolData = lendingPoolsData[lendingPool.id];
  const farmingPoolData = lendingPoolData[poolTokenType].farmingPool;
  if (farmingPoolData === null) {
    rewardSpeed = 0;
  } else {
    const segmentLength = parseInt(farmingPoolData.segmentLength);
    const epochBegin = parseInt(farmingPoolData.epochBegin);
    const epochAmount = parseFloat(farmingPoolData.epochAmount);
    const epochEnd = epochBegin + segmentLength;
    const timestamp = (new Date()).getTime() / 1000;
    if (timestamp > epochEnd) {
      // How to manage better this case? Maybe check shares on distributor
      rewardSpeed = 0;
    } else {
      rewardSpeed = epochAmount / segmentLength;
    }
  }

  let farmingPoolAPYA;
  if (totalBorrowsUSDA === 0) {
    farmingPoolAPYA = 0;
  } else {
    farmingPoolAPYA = toAPY(imxPrice * rewardSpeed / totalBorrowsUSDA);
  }
  let farmingPoolAPYB;
  if (totalBorrowsUSDA === 0) {
    farmingPoolAPYB = 0;
  } else {
    farmingPoolAPYB = toAPY(imxPrice * rewardSpeed / totalBorrowsUSDB);
  }
  // const farmingPoolAPYA = useFarmingAPY(PoolTokenType.BorrowableA);
  // const farmingPoolAPYB = useFarmingAPY(PoolTokenType.BorrowableB);
  // ray test touch >>
  const tokenIconA = useTokenIcon(PoolTokenType.BorrowableA);
  const tokenIconB = useTokenIcon(PoolTokenType.BorrowableB);
  const lendingPoolUrl = useLendingPoolURL();
  const uniAPY = useUniswapAPY();
  const averageAPY = (borrowAPYA + borrowAPYB - farmingPoolAPYA - farmingPoolAPYB) / 2;
  const leveragedAPY = uniAPY * LEVERAGE - averageAPY * (LEVERAGE - 1);

  return (
    <Link
      to={lendingPoolUrl}
      className='block'>
      <Panel
        className={clsx(
          'px-4',
          'py-5',
          'md:p-6',
          'hover:bg-gray-50'
        )}>
        {greaterThanMd ? (
          <LendingPoolDesktopGridWrapper>
            <TokenPairLabel
              className='col-span-2'
              tokenIconA={tokenIconA}
              tokenIconB={tokenIconB}
              symbolA={symbolA}
              symbolB={symbolB} />
            <SetWrapper>
              <TokenLabel
                tokenIcon={tokenIconA}
                symbol={symbolA} />
              <TokenLabel
                tokenIcon={tokenIconB}
                symbol={symbolB} />
            </SetWrapper>
            <SetWrapper>
              <Value>{formatUSD(supplyUSDA)}</Value>
              <Value>{formatUSD(supplyUSDB)}</Value>
            </SetWrapper>
            <SetWrapper>
              <Value>{formatUSD(totalBorrowsUSDA)}</Value>
              <Value>{formatUSD(totalBorrowsUSDB)}</Value>
            </SetWrapper>
            <SetWrapper>
              <Value>{formatPercentage(supplyAPYA)}</Value>
              <Value>{formatPercentage(supplyAPYB)}</Value>
            </SetWrapper>
            <SetWrapper>
              <Value>{formatPercentage(borrowAPYA)}</Value>
              <Value>{formatPercentage(borrowAPYB)}</Value>
            </SetWrapper>
            <Value
              className={clsx(
                'self-center',
                'justify-self-center',
                'text-lg',
                'font-medium',
                'text-impermaxAstral'
              )}>
              {formatPercentage(leveragedAPY)}
            </Value>
          </LendingPoolDesktopGridWrapper>
        ) : (
          <>
            <LendingPoolMobileGridWrapper>
              <TokenPairLabel
                tokenIconA={tokenIconA}
                tokenIconB={tokenIconB}
                symbolA={symbolA}
                symbolB={symbolB} />
              <TokenLabel
                tokenIcon={tokenIconA}
                symbol={symbolA} />
              <TokenLabel
                tokenIcon={tokenIconB}
                symbol={symbolB} />
            </LendingPoolMobileGridWrapper>
            <LendingPoolMobileGridWrapper
              className={clsx(
                'gap-y-1.5',
                'mt-2.5'
              )}>
              <>
                <PropertyLabel className='self-center'>
                  Total supply
                </PropertyLabel>
                <Value>{formatUSD(supplyUSDA)}</Value>
                <Value>{formatUSD(supplyUSDB)}</Value>
              </>
              <>
                <PropertyLabel className='self-center'>
                  Total borrowed
                </PropertyLabel>
                <Value>{formatUSD(totalBorrowsUSDA)}</Value>
                <Value>{formatUSD(totalBorrowsUSDB)}</Value>
              </>
              <>
                <PropertyLabel className='self-center'>
                  Supply APY
                </PropertyLabel>
                <Value>{formatPercentage(supplyAPYA)}</Value>
                <Value>{formatPercentage(supplyAPYB)}</Value>
              </>
              <>
                <PropertyLabel className='self-center'>
                  Borrow APY
                </PropertyLabel>
                <Value>{formatPercentage(borrowAPYA)}</Value>
                <Value>{formatPercentage(borrowAPYB)}</Value>
              </>
              <>
                <PropertyLabel className='self-center'>
                  Leveraged LP APY
                </PropertyLabel>
                <Value
                  className={clsx(
                    'col-span-2',
                    'justify-self-center',
                    'text-lg',
                    'font-medium',
                    'text-impermaxAstral'
                  )}>
                  {formatPercentage(leveragedAPY)}
                </Value>
              </>
            </LendingPoolMobileGridWrapper>
          </>
        )}
      </Panel>
    </Link>
  );
};

export default LendingPool;
