import type { NextApiRequest, NextApiResponse } from "next";
import {
  ThirdwebSDK,
  NFTMetadataOwner,
  PayloadToSign721,
} from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
// We use dotenv to securely manage our private key.
// If you deploy this project to Vercel, use their environment variable management instead
import dotenv from "dotenv";

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let nfts = [
    {
      id: 0,
      name: "Sofa",
      description: "This is the first Sofa NFT",
      animation_url:
        "https://ipfs.io/ipfs/QmctyKqThvQNmiheHVYAjCdTXwUgD28Bmz3ogx52q4oqEz?filename=0.glb",
      image_url:
        "https://ipfs.io/ipfs/Qme63voeQuJLUv9GjhLDfKHX4CfXUEDD62cidRjJUXYHnv?filename=0.png",
      price: 0.01,
      minted: false,
    },
    {
      id: 1,
      name: "Chair",
      description: "This is the first Chair NFT",
      animation_url:
        "https://ipfs.io/ipfs/QmSVCpwPsMnWFifbaTLq43wt2fg8FHRP1NGGGfQpbzVnsT?filename=1.glb",
      image_url:
        "https://ipfs.io/ipfs/Qmf6gY3vMXrJKKqFGtiQQZKgCoZFW8rJ1NLqqLAVn47yNU?filename=1.png",
      price: 0.01,
      minted: false,
    },
    {
      id: 2,
      name: "Water Bottle",
      description: "This is the first water bottle NFT",
      animation_url:
        "https://ipfs.io/ipfs/QmUgA6Mgo8rExQyty48fSmovpes9guY7hLo5gpShXXHyum?filename=2.glb",
      image_url:
        "https://ipfs.io/ipfs/QmcTmd8WZnALwK7h7XhGKEsxZ7r4tfRYgZQC5xhkyc3sAD?filename=2.png",
      price: 0.01,
      minted: false,
    },
  ];

  // Connect to thirdweb SDK
  const sdk = new ThirdwebSDK(
    new ethers.Wallet(
      // Your wallet private key
      process.env.PRIVATE_KEY as string,
      // RPC URL
      ethers.getDefaultProvider(
        "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
      )
    )
  );

  // Set variable for the NFT collection contract address which can be found after creating an NFT collection in the dashboard
  const nftCollectionAddress = "0x6B9C9F7d02f14f5e1a8414e4863DC2D966D34119";

  // Initialize the NFT collection with the contract address
  const nftCollection = sdk.getNFTCollection(nftCollectionAddress);

  switch (req.method) {
    case "GET":
      try {
        // Get all the NFTs that have been minted from the contract
        const mintedNfts: NFTMetadataOwner[] = await nftCollection?.getAll();
        // If no NFTs have been minted, return the array of NFT metadata
        if (!mintedNfts) {
          res.status(200).json(nfts);
        }
        // If there are NFTs that have been minted, go through each of them
        mintedNfts.forEach((nft) => {
          if (nft.metadata.attributes) {
            // Find the id attribute of the current NFT
            // @ts-expect-error
            const positionInMetadataArray = nft.metadata.attributes.id;

            if (positionInMetadataArray) {
              // Change the minted status of the NFT metadata at the position of ID in the NFT metadata array
              nfts[positionInMetadataArray].minted = true;
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
      res.status(200).json(nfts);
      break;
    case "POST":
      // Get ID of the NFT to mint and address of the user from request body
      const { id, address } = req.body;

      // Ensure that the requested NFT has not yet been minted
      if (nfts[id].minted === true) {
        res.status(400).json({ message: "Invalid request" });
      }

      // Allow the minting to happen anytime from now
      const startTime = new Date(0);

      // Find the NFT to mint in the array of NFT metadata using the ID
      const nftToMint = nfts[id];

      // Set up the NFT metadata for signature generation
      const metadata: PayloadToSign721 = {
        metadata: {
          name: nftToMint.name,
          description: nftToMint.description,
          image: nftToMint.image_url,
          animation_url: nftToMint.animation_url,
          // Set the id attribute which we use to find which NFTs have been minted
          attributes: { id },
        },
        price: nftToMint.price,
        mintStartTime: startTime,
        to: address,
      };

      try {
        const response = await nftCollection?.signature.generate(metadata);

        // Respond with the payload and signature which will be used in the frontend to mint the NFT
        res.status(201).json({
          payload: response?.payload,
          signature: response?.signature,
        });
      } catch (error) {
        res.status(500).json({ error });
        console.error(error);
      }
      break;
    default:
      res.status(200).json(nfts);
  }
}
