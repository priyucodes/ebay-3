import { useContract, useAddress } from '@thirdweb-dev/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import Header from '../components/Header';

type Props = {};
const addItem = ({}: Props) => {
  const [preview, setPreview] = useState<String>();
  const [image, setImage] = useState<File>();
  const address = useAddress();
  const router = useRouter();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    'nft-collection'
  );

  const mintNft = async (e: FormEvent<HTMLFormElement>) => {
    // Trick to get type defination is to go to the form(in our case) and add e=> onFunction handler then hover over it it will say
    e.preventDefault();

    if (!contract || !address) return;

    if (!image) {
      alert('Please select an image');
      return;
    }

    // We can useState (different for each field or an object contating all fields and their values) or we can use refs, in this case we are using id and names for referencing the values. either one of them is fine depending on your use case.

    const target = e.target as typeof e.target & {
      name: { value: string };
      description: { value: string };
    };

    const metadata = {
      name: target.name.value,
      description: target.description.value,
      image: image, // image URL or file
    };

    try {
      const tx = await contract.mintTo(address, metadata);
      const receipt = tx.receipt; // the transcation receipt
      const tokenId = tx.id; // the id of the NFT minted
      const nft = await tx.data(); // (optional) fetch details of minted NFT
      console.log(receipt, tokenId, nft);

      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-10 border">
        <h1 className="text-4xl font-bold">Add an Item to the Marketplace</h1>
        <h2 className="text-xl font-semibold pt-5">Item Details</h2>
        <p className="pb-5">
          By Adding an item to the marketplace, you're essentially Minting an
          NFT of the item into your wallet which we can then list for sale!
        </p>

        <div className="flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-5">
          <Image
            src={preview || ('https://links.papareact.com/ucj' as any)}
            alt="placeholder image"
            className="border h-80 w-80 object-contain"
            width={320}
            height={320}
          />

          <form
            onSubmit={mintNft}
            className="flex flex-col flex-1 p-2 space-y-2"
          >
            <label className="font-light">Name of Item</label>
            <input
              className="formField"
              placeholder="Name of item..."
              type="text"
              id="name"
              name="name"
            />

            <label className="font-light">Description</label>
            <input
              className="formField"
              placeholder="Enter Description"
              type="text"
              id="description"
              name="description"
            />
            <label className="font-light" htmlFor="file-input">
              Image of the Item
            </label>
            <input
              className=""
              type="file"
              id="file-input"
              onChange={e => {
                if (e.target.files?.[0]) {
                  // these imgs are uploaded to IPFS(InterPlanetary File System)
                  setPreview(URL.createObjectURL(e.target.files[0]));
                  setImage(e.target.files[0]);
                }
              }}
            />

            <button
              type="submit"
              className="bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 md:mt-auto mx-auto md:ml-auto"
            >
              Add/Mint Item
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
export default addItem;
