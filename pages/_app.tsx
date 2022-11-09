import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import network from '../utils/network';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // blockchain have different networks, mainnets and testnets and they alsohave nested networks
    <ThirdwebProvider desiredChainId={network}>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
