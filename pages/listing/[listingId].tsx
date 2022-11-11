import { UserCircleIcon } from '@heroicons/react/24/solid';
import {
  MediaRenderer,
  useContract,
  useListing,
  useMinimumNextBid,
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useMakeOffer,
  useOffers,
  useBuyNow,
  useAddress,
  useAcceptDirectListingOffer,
} from '@thirdweb-dev/react';
import { ListingType, NATIVE_TOKENS } from '@thirdweb-dev/sdk';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Countdown from 'react-countdown';
import network from '../../utils/network';
import { ethers } from 'ethers';
type Props = {};
const ListingPage = ({}: Props) => {
  const router = useRouter();
  const { listingId } = router.query as { listingId: string };

  // If u have more pages that uses minNextBid then use their hook
  const [minimumNextBid, setMinimumNextBid] = useState<{
    displayValue: string;
    symbol: string;
  }>();
  const [bidAmount, setBidAmount] = useState('');
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    'marketplace'
  );
  const { data: listing, isLoading, error } = useListing(contract, listingId);
  const [, switchNetwork] = useNetwork();
  const networkMismatch = useNetworkMismatch();
  const { mutate: buyNow } = useBuyNow(contract);
  const { mutate: makeOffer } = useMakeOffer(contract);
  const { data: offers } = useOffers(contract, listingId);
  const { mutate: makeBid } = useMakeBid(contract);
  const address = useAddress();
  const { mutate: acceptOffer } = useAcceptDirectListingOffer(contract);
  // const acceptOffer = async (offer: Record<string, any>) => {};
  useEffect(() => {
    if (!listingId || !contract || !listing) return;

    // Sometimes listing type is direct, thats why we are not using hook provided by thirdweb
    if (listing.type === ListingType.Auction) {
      fetchMinNextBid();
    }
  }, [listingId, contract, listing]);

  const buyNft = async () => {
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }
    if (!listingId || !contract || !listing) return;
    await buyNow(
      { id: listingId, buyAmount: 1, type: listing.type },
      {
        onSuccess(data, variables, context) {
          alert('NFT bought successfully!');
          console.log('SUCCESS', data, variables, context);
          router.replace('/');
        },
        onError(error, variables, context) {
          alert('ERROR: NFT could not be bought');
          console.log(error, variables, context);
        },
      }
    );
  };
  const createBidOrOffer = async () => {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(network);
        return;
      }

      // Direct Listing(Offer)
      if (listing?.type === ListingType.Direct) {
        if (
          listing.buyoutPrice.toString() ===
          ethers.utils.parseEther(bidAmount).toString()
        ) {
          console.log('Buyout price met, buying NFT...');
          buyNft();
          return;
        }

        console.log('Buyout price was not met, making offer...');

        // Behind the scenes it uses react-query useQuery
        await makeOffer(
          { listingId, quantity: 1, pricePerToken: bidAmount },
          {
            onSuccess(data, variables, context) {
              alert('Offer made successfully!');
              console.log('SUCCESS', data, variables, context);
              setBidAmount('');
            },
            onError(error, variables, context) {
              alert('ERROR: Offer could not be made');
              console.log('ERROR', error, variables, context);
            },
          }
        );
      }

      // Auction (Bid)
      if (listing?.type === ListingType.Auction) {
        console.log('Making Bid...');
        if (
          listing.buyoutPrice.toString() ===
          ethers.utils.parseEther(bidAmount).toString()
        ) {
          console.log('Buyout price met, buying NFT...');
          buyNft();
          return;
        }
        await makeBid(
          { listingId, bid: bidAmount },
          {
            onSuccess(data, variables, context) {
              alert('Bid made successfully!');
              console.log('SUCCESS', data, variables, context);
              setBidAmount('');
            },
            onError(error, variables, context) {
              alert('ERROR: Bid could not be made');
              console.log(error, variables, context);
            },
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMinNextBid = async () => {
    if (!listingId || !contract) return;
    const { displayValue, symbol } = await contract.auction.getMinimumNextBid(
      listingId
    );
    setMinimumNextBid({
      displayValue: displayValue,
      symbol: symbol,
    });
  };

  const formatPlaceholder = () => {
    if (!listing) return;
    if (listing.type === ListingType.Direct) {
      return 'Enter Offer Amount';
    }
    if (listing.type === ListingType.Auction) {
      if (!minimumNextBid) return 'Enter Bid Amount';
      return Number(minimumNextBid?.displayValue) === 0
        ? 'Enter Bid Amount'
        : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;

      // TODO:  Improve BID amt
    }
  };
  if (isLoading)
    return (
      <div>
        <Header />
        <div className="text-center animate-pulse text-blue-500">
          <p>Loading Item...</p>
        </div>
      </div>
    );
  if (!listing) {
    return <div>Listing not found</div>;
  }
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
        <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
          <MediaRenderer src={listing.asset.image} alt="nft" />
        </div>

        <section className="flex-1 space-y-5 pb-20 lg:pb-0">
          <div>
            <h1 className="text-xl font-bold">{listing.asset.name}</h1>
            <p className="text-gray-600">{listing.asset.description}</p>
            <p className="flex items-center text-xs sm:text-base">
              <UserCircleIcon className="h-5" />
              <span className="font-bold pr-1">
                Seller: {listing.sellerAddress}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 items-center py-2">
            <p className="font-bold">Listing Type: </p>
            <p>
              {/* listing.type===0 ? 'Direct' : 'Auction' */}
              {listing.type === ListingType.Direct
                ? 'Direct Listing'
                : 'Auction Listing'}
            </p>
            <p className="font-bold">Buy it Now Price: </p>
            <p className="text-4xl font-bold">
              {listing.buyoutCurrencyValuePerToken.displayValue}{' '}
              {listing.buyoutCurrencyValuePerToken.symbol}
            </p>
            <button
              onClick={buyNft}
              className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10"
            >
              Buy Now
            </button>
          </div>

          {/* If Direct, show offers, If Auctions, show bidding */}
          {listing.type === ListingType.Direct && offers && (
            <div className="grid grid-cols-2 gap-y-2">
              <p className="font-bold">Offers: </p>
              <p className="font-bold">
                {offers.length > 0 ? offers.length : 0}
              </p>

              {offers.map(offer => (
                <>
                  <p className="flex items-center ml-5 text-sm italic">
                    <UserCircleIcon className="h-3 mr-2" />
                    {offer.offeror.slice(0, 5) +
                      '...' +
                      offer.offeror.slice(-5)}
                  </p>
                  <div>
                    <p
                      key={
                        offer.listingId +
                        offer.offeror +
                        offer.totalOfferAmount.toString()
                      }
                      className="text-sm italic"
                    >
                      {ethers.utils.formatEther(offer.totalOfferAmount)}{' '}
                      {NATIVE_TOKENS[network].symbol}
                    </p>
                    {listing.sellerAddress === address && (
                      <button
                        onClick={() => {
                          acceptOffer(
                            {
                              listingId,
                              addressOfOfferor: offer.offeror,
                            },
                            {
                              onSuccess(data, variables, context) {
                                alert('Offer accepted successfully!');
                                console.log(
                                  'SUCCESS',
                                  data,
                                  variables,
                                  context
                                );
                                router.replace('/');
                              },
                              onError(error, variables, context) {
                                alert('ERROR: Offer could not be accepted');
                                console.log('ERROR', error, variables, context);
                              },
                            }
                          );
                        }}
                        className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Accept Offer
                      </button>
                    )}
                  </div>
                </>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 space-y-2 items-center justify-end">
            <hr className="col-span-2" />
            <p className="col-span-2 font-bold">
              {listing.type === ListingType.Direct
                ? 'Make an Offer'
                : 'Bid on this Auction'}
            </p>

            {listing.type === ListingType.Auction && (
              <>
                <p>Current Minimum Bid:</p>
                <p className="font-bold">
                  {minimumNextBid?.displayValue} {minimumNextBid?.symbol}
                </p>

                <p>Time Remaining: </p>
                <Countdown
                  // endTimeInEpochSeconds(milliseconds) is bigNumberish so we convert
                  date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}
                />
              </>
            )}
            <input
              className="border p-2 rounded-lg mr-5 outline-blue-500"
              type="text"
              placeholder={formatPlaceholder()}
              onChange={e => setBidAmount(e.target.value)}
            />
            <button
              onClick={createBidOrOffer}
              className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10"
            >
              {listing.type === ListingType.Direct ? 'Offer' : 'Bid'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
export default ListingPage;
