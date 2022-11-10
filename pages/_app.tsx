import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import network from '../utils/network';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  // https://stackoverflow.com/questions/62006153/adding-a-persistent-component-to-app-js-in-nextjs instead of reusing component on every page.
  // https://nextjs.org/docs/advanced-features/custom-app
  // https://www.npmjs.com/package/react-dropzone
  // https://nextjs.org/docs/advanced-features/custom-document
  // https://stackoverflow.com/questions/68914618/is-it-possible-to-use-husky-lint-stages-to-check-for-console-logs
  // https://www.davidhu.io/react-spinners/ https://www.npmjs.com/package/react-spinners
  // https://www.npmjs.com/package/react-loader-spinner
  return (
    // blockchain have different networks, mainnets and testnets and they alsohave nested networks
    <ThirdwebProvider desiredChainId={network}>
      <Head>
        <title>Ebay | Web3</title>
      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
