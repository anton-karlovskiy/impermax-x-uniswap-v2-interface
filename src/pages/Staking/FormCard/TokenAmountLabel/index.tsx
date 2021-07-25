
import * as React from 'react';
import {
  useErrorHandler,
  withErrorBoundary
} from 'react-error-boundary';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import clsx from 'clsx';
import { useQuery } from 'react-query';

import ImpermaxJadeBadge from 'components/badges/ImpermaxJadeBadge';
import ErrorFallback from 'components/ErrorFallback';
import formatNumberWithFixedDecimals from 'utils/helpers/format-number-with-fixed-decimals';
import xIMXDataFetcher, {
  XImxData,
  X_IMX_DATA_FETCHER
} from 'services/fetchers/x-imx-data-fetcher';

// TODO: not used for now
// import { formatUnits } from '@ethersproject/units';
// import { BigNumber } from '@ethersproject/bignumber';
// import { Contract } from '@ethersproject/contracts';
// import { X_IMX_ADDRESSES } from 'config/web3/contracts/x-imxes';
// import STATUSES from 'utils/constants/statuses';
// import PoolTokenJSON from 'abis/contracts/IPoolToken.json';
// const getXIMXContract = (xIMXAddress: string, library: Web3Provider) => {
//   return new Contract(xIMXAddress, PoolTokenJSON.abi, library);
// };
// const xIMXContract = getXIMXContract(X_IMX_ADDRESSES[chainId], library);
// const bigXIMXRate: BigNumber = await mounted(xIMXContract.callStatic.exchangeRate());
// const floatXIMXRate = parseFloat(formatUnits(bigXIMXRate));
// const xIMXRate = formatNumberWithFixedDecimals(floatXIMXRate, 5);

interface CustomProps {
  text: string;
}

const TokenAmountLabel = ({
  text,
  className,
  ...rest
}: CustomProps & Omit<React.ComponentPropsWithRef<'label'>, 'children'>): JSX.Element => {
  const {
    chainId,
    active
  } = useWeb3React<Web3Provider>();

  const {
    isLoading: xIMXDataLoading,
    data: xIMXData,
    error: xIMXDataError
  } = useQuery<XImxData, Error>(
    [
      X_IMX_DATA_FETCHER,
      chainId
    ],
    xIMXDataFetcher,
    {
      enabled: chainId !== undefined
    }
  );
  useErrorHandler(xIMXDataError);

  let xIMXRateLabel;
  if (active) {
    if (xIMXDataLoading) {
      xIMXRateLabel = 'Loading...';
    } else {
      if (xIMXData === undefined) {
        throw new Error('Something went wrong!');
      }

      const xIMXRate = Number(xIMXData.exchangeRate);
      xIMXRateLabel = formatNumberWithFixedDecimals(xIMXRate, 5);
    }
  } else {
    xIMXRateLabel = '-';
  }

  return (
    <label
      className={clsx(
        'flex',
        'justify-between',
        'items-center',
        className
      )}
      {...rest}>
      <span
        className={clsx(
          'text-2xl',
          'font-medium'
        )}>
        {text}
      </span>
      <ImpermaxJadeBadge>1 xIMX = {xIMXRateLabel} IMX</ImpermaxJadeBadge>
    </label>
  );
};

export default withErrorBoundary(TokenAmountLabel, {
  FallbackComponent: ErrorFallback,
  onReset: () => {
    window.location.reload();
  }
});
