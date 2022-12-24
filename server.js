const { ApolloServer, gql } = require('apollo-server');
const fetch = require('node-fetch');
const Web3 = require('web3');

// Create a Web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/8957e673a9cd49159bb710207f4fe457'));

// Define the GraphQL schema for the NFT type
const typeDefs = gql`
  type NFT {
    contractAddress: String!
    tokenId: String!
    blockNumber: Int!
    blockTimestamp: String!
    amount: String!
  }

  type Query {
    nfts(walletAddress: String!): [NFT]!
  }
`;

// Define the resolvers for the NFT type
const resolvers = {
  Query: {
    nfts: async (_, { walletAddress }) => {
      // Fetch the NFTs for the given wallet address using the developers.icy.tools API
      const response = await fetch(`https://developers.icy.tools/api/v1/nfts?wallet=${walletAddress}`);
      const data = await response.json();

      // Map the NFTs to an array of NFTs with the necessary information
      return data.nfts.map((nft) => {
        // Get the contract address and token ID from the NFT data
        const { contractAddress, tokenId } = nft;

        // Get the block number and block timestamp for the transaction that created the NFT
        const { blockNumber, timestamp } = web3.eth.getTransaction(nft.txHash);

        // Get the amount that the NFT was bought for
        const amount = web3.utils.fromWei(nft.value, 'ether');

        // Return the NFT with the necessary information
        return {
          contractAddress,
          tokenId,
          blockNumber,
          blockTimestamp: timestamp,
          amount,
        };
      });
    },
  },
};

// Create the Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
