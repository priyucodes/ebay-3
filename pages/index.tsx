import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';

const Home = () => {
  return (
    <div className="">
      <Head>
        <title>EBAY 3.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
    </div>
  );
};

export default Home;
