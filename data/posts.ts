export interface Post {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    location: string;
  };
  content: {
    image: string;
    caption: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isNFT: boolean;
  nftPrice?: string;
  timeAgo: string;
}

export const posts: Post[] = [
  {
    id: 1,
    user: {
      name: "Alex Chen",
      username: "@alexcrypto",
      avatar: "/trading-avatar.jpg",
      location: "San Francisco, CA",
    },
    content: {
      image: "/digital-art-neon-cyberpunk.jpg",
      caption:
        "Just minted my latest piece! The intersection of AI and human creativity never ceases to amaze me. This NFT represents the future of digital art.",
    },
    stats: { likes: 1247, comments: 89, shares: 156 },
    isNFT: true,
    nftPrice: "2.5 ETH",
    timeAgo: "2h",
  },
  {
    id: 2,
    user: {
      name: "Maya Rodriguez",
      username: "@mayacollects",
      avatar: "/nft-collector-avatar.png",
      location: "Miami, FL",
    },
    content: {
      image: "/nft-collection-futuristic.jpg",
      caption:
        "Found this gem in the depths of the metaverse. Sometimes the best discoveries happen when you're not looking for them.",
    },
    stats: { likes: 892, comments: 67, shares: 94 },
    isNFT: true,
    nftPrice: "1.8 ETH",
    timeAgo: "4h",
  },
  {
    id: 3,
    user: {
      name: "Jordan Kim",
      username: "@web3builder",
      avatar: "/developer-avatar.png",
      location: "Seoul, South Korea",
    },
    content: {
      image: "/web3-development-code.png",
      caption:
        "Building the future, one smart contract at a time. This new DeFi protocol is going to change everything.",
    },
    stats: { likes: 2156, comments: 234, shares: 445 },
    isNFT: false,
    timeAgo: "6h",
  },
];
