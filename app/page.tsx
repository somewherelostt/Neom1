"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Search,
  Plus,
  TrendingUp,
  User,
  Users,
  UserPlus,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Filter,
  Star,
  Zap,
  Crown,
  ShoppingCart,
  DollarSign,
  Clock,
  Activity,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "@/components/wallet-connect";
import { WebSocketStatus } from "@/components/websocket-status";
import { AutoAuth } from "@/components/auto-auth";
import { TransferComponent } from "@/components/transfer-component";
import { BalanceComponent } from "@/components/balance-component";
import { ConnectionDiagnostic } from "@/components/connection-diagnostic";
import { type WalletState } from "@/lib/wallet";
import { authenticationService, type AuthState } from "@/lib/authentication";
import { posts, type Post } from "@/data/posts";

export default function NeomApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    walletClient: null,
    isConnected: false,
  });
  const [authState, setAuthState] = useState<AuthState>(
    authenticationService.getAuthState()
  );

  useEffect(() => {
    // Listen to authentication state changes
    authenticationService.addListener(setAuthState);

    return () => {
      authenticationService.removeListener(setAuthState);
    };
  }, []);

  const handleWalletConnectionChange = (newWalletState: WalletState) => {
    setWalletState(newWalletState);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B2A] via-[#1C1C40] to-[#0B0B2A] text-white">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-3 text-sm font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white/60 rounded-full"></div>
          </div>
          <svg className="w-4 h-4 ml-1" fill="white" viewBox="0 0 24 24">
            <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48L6.3 12l-1.45-.95zM13 7.5c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5s.67 1.5 1.5 1.5S13 8.33 13 7.5zm-1.5 3.5c-2.21 0-4 1.79-4 4h8c0-2.21-1.79-4-4-4z" />
          </svg>
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-4 h-full bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        {activeTab === "home" && (
          <HomeSection
            walletState={walletState}
            authState={authState}
            onWalletConnectionChange={handleWalletConnectionChange}
          />
        )}
        {activeTab === "discover" && <DiscoverSection />}
        {activeTab === "create" && <CreateSection />}
        {activeTab === "nft" && <NFTSection />}
        {activeTab === "profile" && <ProfileSection />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1C1C40]/90 to-[#0B0B2A]/90 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around px-6 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 p-2 ${
              activeTab === "home" ? "text-[#00E0FF]" : "text-white/60"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("discover")}
            className={`flex flex-col items-center gap-1 p-2 ${
              activeTab === "discover" ? "text-[#00E0FF]" : "text-white/60"
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Discover</span>
          </Button>

          {/* Center Create Button */}
          <Button
            onClick={() => setActiveTab("create")}
            className="relative w-14 h-14 rounded-full bg-gradient-to-r from-[#00E0FF] via-[#FF1CF7] to-[#00FFC6] p-0.5 shadow-lg shadow-[#00E0FF]/25"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0B0B2A] to-[#1C1C40] flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("nft")}
            className={`flex flex-col items-center gap-1 p-2 ${
              activeTab === "nft" ? "text-[#00E0FF]" : "text-white/60"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">NFT</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 p-2 ${
              activeTab === "profile" ? "text-[#00E0FF]" : "text-white/60"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function HomeSection({
  walletState,
  authState,
  onWalletConnectionChange,
}: {
  walletState: WalletState;
  authState: AuthState;
  onWalletConnectionChange: (walletState: WalletState) => void;
}) {
  const [activeHomeTab, setActiveHomeTab] = useState("feed");

  return (
    <div className="relative">
      {/* Header with Tab Navigation */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] bg-clip-text text-transparent">
            NEOM
          </h1>
          <div className="flex items-center gap-3">
            <WebSocketStatus />
            <AutoAuth
              walletClient={walletState.walletClient}
              account={walletState.account}
            />
            <WalletConnect
              onConnectionChange={onWalletConnectionChange}
              currentWalletState={walletState}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-[#1C1C40]/50 rounded-2xl p-1">
          <Button
            onClick={() => setActiveHomeTab("feed")}
            className={`flex-1 rounded-xl h-10 font-semibold transition-all duration-300 ${
              activeHomeTab === "feed"
                ? "bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black shadow-lg"
                : "bg-transparent text-white/60 hover:text-white"
            }`}
          >
            Feed
          </Button>
          <Button
            onClick={() => setActiveHomeTab("communities")}
            className={`flex-1 rounded-xl h-10 font-semibold transition-all duration-300 ${
              activeHomeTab === "communities"
                ? "bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black shadow-lg"
                : "bg-transparent text-white/60 hover:text-white"
            }`}
          >
            Communities
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeHomeTab === "feed" && (
        <FeedSection walletState={walletState} authState={authState} />
      )}
      {activeHomeTab === "communities" && <CommunitiesSection />}

      {/* Floating Create Post Button */}
      <Button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF1CF7] via-[#00E0FF] to-[#00FFC6] p-0.5 shadow-2xl shadow-[#FF1CF7]/30 z-10">
        <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0B0B2A] to-[#1C1C40] flex items-center justify-center">
          <Plus className="w-6 h-6 text-white" />
        </div>
      </Button>
    </div>
  );
}

function FeedSection({
  walletState,
  authState,
}: {
  walletState: WalletState;
  authState: AuthState;
}) {
  const stories = [
    {
      id: 1,
      name: "Your Story",
      avatar: "/crypto-art-avatar.jpg",
      isOwn: true,
      hasStory: false,
    },
    {
      id: 2,
      name: "Alex",
      avatar: "/trading-avatar.jpg",
      isLive: true,
      hasStory: true,
    },
    {
      id: 3,
      name: "Maya",
      avatar: "/nft-collector-avatar.png",
      isLive: false,
      hasStory: true,
    },
    {
      id: 4,
      name: "Jordan",
      avatar: "/developer-avatar.png",
      isLive: true,
      hasStory: true,
    },
    {
      id: 5,
      name: "Sam",
      avatar: "/metaverse-avatar.jpg",
      isLive: false,
      hasStory: true,
    },
    {
      id: 6,
      name: "Riley",
      avatar: "/diverse-gaming-avatars.png",
      isLive: false,
      hasStory: true,
    },
  ];

  const handleSponsor = (post: Post) => {
    // --- WORKSHOP: INSTANT TIP LOGIC ---
    console.log("Sponsoring post:", post.id, "by", post.user.name);
  };

  return (
    <div className="pb-4">
      {/* Stories Row */}
      <div className="px-6 py-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-2 min-w-0"
            >
              <div className="relative">
                {story.isOwn ? (
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white/60" />
                  </div>
                ) : (
                  <>
                    <div
                      className={`w-16 h-16 rounded-full p-0.5 ${
                        story.hasStory
                          ? story.isLive
                            ? "bg-gradient-to-r from-[#00FFC6] via-[#00E0FF] to-[#FF1CF7]"
                            : "bg-gradient-to-r from-[#FF1CF7] to-[#00E0FF]"
                          : "bg-white/20"
                      }`}
                    >
                      <Avatar className="w-full h-full border-2 border-[#0B0B2A]">
                        <AvatarImage
                          src={story.avatar || "/placeholder.svg"}
                          alt={story.name}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black font-bold">
                          {story.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {story.isLive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#00FFC6] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        LIVE
                      </div>
                    )}
                  </>
                )}
              </div>
              <span className="text-xs text-white/80 truncate w-16 text-center">
                {story.isOwn ? "Your Story" : story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Component Demo */}
      <div className="px-6 py-4">
        <div className="flex gap-4 overflow-x-auto">
          <ConnectionDiagnostic />
          <TransferComponent
            sessionKey={authState.sessionKey}
            isAuthenticated={authState.isAuthenticated}
          />
          <BalanceComponent
            sessionKey={authState.sessionKey}
            isAuthenticated={authState.isAuthenticated}
          />
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gradient-to-br from-[#1C1C40]/30 to-[#0B0B2A]/30 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-[#00E0FF]/30">
                  <AvatarImage
                    src={post.user.avatar || "/placeholder.svg"}
                    alt={post.user.name}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black font-bold">
                    {post.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{post.user.name}</h3>
                    {post.isNFT && (
                      <div className="bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        NFT
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/60">
                    {post.user.location} • {post.timeAgo}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            {/* Post Image */}
            <div className="relative">
              <img
                src={post.content.image || "/placeholder.svg"}
                alt="Post content"
                className="w-full aspect-square object-cover"
              />
              {post.isNFT && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-2">
                  <div className="text-[#00FFC6] text-sm font-bold">
                    {post.nftPrice}
                  </div>
                  <div className="text-white/60 text-xs">Current Price</div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-[#FF1CF7] p-0"
                  >
                    <Heart className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-[#00E0FF] p-0"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-[#00FFC6] p-0"
                  >
                    <Share className="w-6 h-6" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white p-0"
                >
                  <Bookmark className="w-6 h-6" />
                </Button>
              </div>

              {/* Post Stats */}
              <div className="flex items-center gap-4 mb-3 text-sm">
                <span className="text-white font-semibold">
                  {post.stats.likes.toLocaleString()} likes
                </span>
                <span className="text-white/60">
                  {post.stats.comments} comments
                </span>
                <span className="text-white/60">
                  {post.stats.shares} shares
                </span>
              </div>

              {/* Post Caption */}
              <div className="text-sm mb-4">
                <span className="font-semibold text-white mr-2">
                  {post.user.username}
                </span>
                <span className="text-white/80">{post.content.caption}</span>
              </div>

              {/* Sponsor Button */}
              <div className="pt-3 border-t border-white/10">
                <Button
                  onClick={() => handleSponsor(post)}
                  disabled={
                    !walletState.isConnected || !authState.isAuthenticated
                  }
                  className={`w-full rounded-2xl font-semibold transition-all duration-300 ${
                    walletState.isConnected && authState.isAuthenticated
                      ? "bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black hover:shadow-lg hover:shadow-[#00E0FF]/25"
                      : "bg-white/10 text-white/40 cursor-not-allowed border border-white/20"
                  }`}
                  title={
                    !walletState.isConnected
                      ? "Connect your wallet to sponsor"
                      : !authState.isAuthenticated
                      ? "Authentication required to sponsor"
                      : "Sponsor author with 1 USDC"
                  }
                >
                  {!walletState.isConnected ? (
                    "Connect Wallet to Sponsor"
                  ) : !authState.isAuthenticated ? (
                    authState.isAuthAttempted ? (
                      "Authenticating..."
                    ) : (
                      "Authentication Required"
                    )
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Sponsor Author
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunitiesSection() {
  const communities = [
    {
      id: 1,
      name: "Crypto Artists",
      members: 12500,
      coverImage: "/digital-art-neon-cyberpunk.jpg",
      avatar: "/crypto-art-avatar.jpg",
      isLive: true,
      description: "Digital art meets blockchain",
    },
    {
      id: 2,
      name: "DeFi Traders",
      members: 8900,
      coverImage: "/trading-charts-neon-blue.jpg",
      avatar: "/trading-avatar.jpg",
      isLive: false,
      description: "Decentralized finance community",
    },
    {
      id: 3,
      name: "NFT Collectors",
      members: 15200,
      coverImage: "/nft-collection-futuristic.jpg",
      avatar: "/nft-collector-avatar.png",
      isLive: true,
      description: "Rare NFT discoveries daily",
    },
    {
      id: 4,
      name: "Web3 Builders",
      members: 6700,
      coverImage: "/web3-development-code.png",
      avatar: "/developer-avatar.png",
      isLive: false,
      description: "Building the future of web",
    },
    {
      id: 5,
      name: "Metaverse Explorers",
      members: 9800,
      coverImage: "/metaverse-virtual-world.png",
      avatar: "/metaverse-avatar.jpg",
      isLive: true,
      description: "Virtual worlds and experiences",
    },
    {
      id: 6,
      name: "GameFi Players",
      members: 11300,
      coverImage: "/gaming-nft-blockchain.jpg",
      avatar: "/diverse-gaming-avatars.png",
      isLive: false,
      description: "Play-to-earn gaming community",
    },
  ];

  return (
    <div className="px-6 py-4">
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button className="flex-1 bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black font-semibold rounded-2xl h-12 shadow-lg shadow-[#00E0FF]/25">
          <Plus className="w-5 h-5 mr-2" />
          Create Club
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-2 border-[#FF1CF7]/30 bg-[#FF1CF7]/10 text-white font-semibold rounded-2xl h-12 hover:bg-[#FF1CF7]/20"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Join Club
        </Button>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-2 gap-4">
        {communities.map((community) => (
          <div key={community.id} className="relative group cursor-pointer">
            {/* Community Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C40]/80 to-[#0B0B2A]/80 backdrop-blur-sm border border-white/10 hover:border-[#00E0FF]/30 transition-all duration-300 group-hover:scale-105">
              {/* Cover Image */}
              <div className="relative h-24 overflow-hidden">
                <img
                  src={community.coverImage || "/placeholder.svg"}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Live Indicator */}
                {community.isLive && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#00FFC6]/20 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#00FFC6] font-medium">
                      LIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Avatar and Name */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-[#00E0FF]/50">
                      <AvatarImage
                        src={community.avatar || "/placeholder.svg"}
                        alt={community.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black text-xs font-bold">
                        {community.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {community.isLive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FFC6] rounded-full border-2 border-[#0B0B2A]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate">
                      {community.name}
                    </h3>
                    <p className="text-xs text-white/60 truncate">
                      {community.description}
                    </p>
                  </div>
                </div>

                {/* Members Count */}
                <div className="flex items-center gap-1 text-[#00E0FF]">
                  <Users className="w-3 h-3" />
                  <span className="text-xs font-semibold">
                    {community.members.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00E0FF]/0 via-[#FF1CF7]/0 to-[#00FFC6]/0 group-hover:from-[#00E0FF]/10 group-hover:via-[#FF1CF7]/10 group-hover:to-[#00FFC6]/10 transition-all duration-300 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Spacing for Navigation */}
      <div className="h-4"></div>
    </div>
  );
}

function DiscoverSection() {
  const [activeDiscoverTab, setActiveDiscoverTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");

  const trendingNFTs = [
    {
      id: 1,
      title: "Cyber Genesis #001",
      creator: { name: "Alex Chen", avatar: "/crypto-art-avatar.jpg" },
      image: "/digital-art-neon-cyberpunk.jpg",
      price: "12.5 ETH",
      likes: 2847,
      category: "Art",
    },
    {
      id: 2,
      title: "Quantum Dreams",
      creator: { name: "Maya Rodriguez", avatar: "/nft-collector-avatar.png" },
      image: "/nft-collection-futuristic.jpg",
      price: "8.2 ETH",
      likes: 1923,
      category: "Digital",
    },
    {
      id: 3,
      title: "Metaverse Portal",
      creator: { name: "Jordan Kim", avatar: "/developer-avatar.png" },
      image: "/metaverse-virtual-world.png",
      price: "15.7 ETH",
      likes: 3456,
      category: "3D",
    },
    {
      id: 4,
      title: "DeFi Revolution",
      creator: { name: "Sam Wilson", avatar: "/trading-avatar.jpg" },
      image: "/trading-charts-neon-blue.jpg",
      price: "6.9 ETH",
      likes: 1567,
      category: "Finance",
    },
  ];

  const topCreators = [
    {
      id: 1,
      name: "Alex Chen",
      username: "@alexcrypto",
      avatar: "/crypto-art-avatar.jpg",
      followers: "125K",
      verified: true,
      totalSales: "2,847 ETH",
    },
    {
      id: 2,
      name: "Maya Rodriguez",
      username: "@mayacollects",
      avatar: "/nft-collector-avatar.png",
      followers: "89K",
      verified: true,
      totalSales: "1,923 ETH",
    },
    {
      id: 3,
      name: "Jordan Kim",
      username: "@web3builder",
      avatar: "/developer-avatar.png",
      followers: "156K",
      verified: true,
      totalSales: "3,456 ETH",
    },
    {
      id: 4,
      name: "Sam Wilson",
      username: "@samdefi",
      avatar: "/metaverse-avatar.jpg",
      followers: "67K",
      verified: false,
      totalSales: "892 ETH",
    },
  ];

  const popularBets = [
    {
      id: 1,
      title: "Will ETH hit $5K?",
      image: "/trading-charts-neon-blue.jpg",
      odds: "2.5x",
      participants: 1247,
      timeLeft: "2d 14h",
      category: "Crypto",
    },
    {
      id: 2,
      title: "Next Viral NFT Drop",
      image: "/nft-collection-futuristic.jpg",
      odds: "4.2x",
      participants: 892,
      timeLeft: "1d 8h",
      category: "NFT",
    },
    {
      id: 3,
      title: "Metaverse Land Boom",
      image: "/metaverse-virtual-world.png",
      odds: "3.1x",
      participants: 2156,
      timeLeft: "5d 2h",
      category: "Virtual",
    },
    {
      id: 4,
      title: "GameFi Token Rally",
      image: "/gaming-nft-blockchain.jpg",
      odds: "5.7x",
      participants: 634,
      timeLeft: "3d 19h",
      category: "Gaming",
    },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] bg-clip-text text-transparent">
            Discover
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            placeholder="Search name, place, community, or NFT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 bg-[#1C1C40]/50 border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:border-[#00E0FF]/50 focus:ring-[#00E0FF]/25"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "trending", label: "Trending", icon: TrendingUp },
            { id: "creators", label: "Top Creators", icon: Crown },
            { id: "bets", label: "Popular Bets", icon: Zap },
            { id: "communities", label: "Hot Clubs", icon: Users },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveDiscoverTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 ${
                activeDiscoverTab === tab.id
                  ? "bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black shadow-lg"
                  : "bg-[#1C1C40]/30 text-white/60 hover:text-white hover:bg-[#1C1C40]/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {activeDiscoverTab === "trending" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00E0FF]" />
              Trending NFTs
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {trendingNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="relative group cursor-pointer bg-gradient-to-br from-[#1C1C40]/30 to-[#0B0B2A]/30 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-[#00E0FF]/30 transition-all duration-300 hover:scale-105"
                >
                  {/* NFT Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-[#00E0FF]/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs text-[#00E0FF] font-medium">
                        {nft.category}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-2xl px-2 py-1">
                      <span className="text-xs text-[#00FFC6] font-bold">
                        {nft.price}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-2 truncate">
                      {nft.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-[#00E0FF]/30">
                          <AvatarImage
                            src={nft.creator.avatar || "/placeholder.svg"}
                            alt={nft.creator.name}
                          />
                          <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black text-xs font-bold">
                            {nft.creator.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-white/60 truncate">
                          {nft.creator.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[#FF1CF7]">
                        <Heart className="w-3 h-3" />
                        <span className="text-xs font-semibold">
                          {nft.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00E0FF]/0 via-[#FF1CF7]/0 to-[#00FFC6]/0 group-hover:from-[#00E0FF]/10 group-hover:via-[#FF1CF7]/10 group-hover:to-[#00FFC6]/10 transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDiscoverTab === "creators" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FF1CF7]" />
              Top Creators
            </h2>
            <div className="space-y-4">
              {topCreators.map((creator, index) => (
                <div
                  key={creator.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#1C1C40]/30 to-[#0B0B2A]/30 backdrop-blur-sm border border-white/10 rounded-3xl hover:border-[#FF1CF7]/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-[#FF1CF7]/30">
                      <AvatarImage
                        src={creator.avatar || "/placeholder.svg"}
                        alt={creator.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black font-bold">
                        {creator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {creator.verified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FFC6] rounded-full flex items-center justify-center">
                        <Star className="w-2 h-2 text-black" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-sm">
                        {creator.name}
                      </h3>
                      {creator.verified && (
                        <Star className="w-3 h-3 text-[#00FFC6]" />
                      )}
                    </div>
                    <p className="text-xs text-white/60">{creator.username}</p>
                    <p className="text-xs text-[#00E0FF] font-semibold">
                      {creator.totalSales} total sales
                    </p>
                  </div>

                  {/* Followers */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      {creator.followers}
                    </p>
                    <p className="text-xs text-white/60">followers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDiscoverTab === "bets" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#00FFC6]" />
              Popular Bets
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {popularBets.map((bet) => (
                <div
                  key={bet.id}
                  className="relative group cursor-pointer bg-gradient-to-br from-[#1C1C40]/30 to-[#0B0B2A]/30 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-[#00FFC6]/30 transition-all duration-300 hover:scale-105"
                >
                  {/* Bet Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={bet.image || "/placeholder.svg"}
                      alt={bet.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Odds */}
                    <div className="absolute top-3 right-3 bg-[#00FFC6]/20 backdrop-blur-sm rounded-2xl px-2 py-1">
                      <span className="text-xs text-[#00FFC6] font-bold">
                        {bet.odds}
                      </span>
                    </div>

                    {/* Time Left */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-xs text-white font-medium">
                        {bet.timeLeft}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-2 truncate">
                      {bet.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#00E0FF]">
                        <Users className="w-3 h-3" />
                        <span className="text-xs font-semibold">
                          {bet.participants.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-[#FF1CF7]/20 rounded-full px-2 py-0.5">
                        <span className="text-xs text-[#FF1CF7] font-medium">
                          {bet.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00FFC6]/0 via-[#00E0FF]/0 to-[#FF1CF7]/0 group-hover:from-[#00FFC6]/10 group-hover:via-[#00E0FF]/10 group-hover:to-[#FF1CF7]/10 transition-all duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDiscoverTab === "communities" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00E0FF]" />
              Hot Communities
            </h2>
            <CommunitiesGrid />
          </div>
        )}
      </div>
    </div>
  );
}

function CommunitiesGrid() {
  const communities = [
    {
      id: 1,
      name: "Crypto Artists",
      members: 12500,
      coverImage: "/digital-art-neon-cyberpunk.jpg",
      avatar: "/crypto-art-avatar.jpg",
      isLive: true,
      description: "Digital art meets blockchain",
    },
    {
      id: 2,
      name: "DeFi Traders",
      members: 8900,
      coverImage: "/trading-charts-neon-blue.jpg",
      avatar: "/trading-avatar.jpg",
      isLive: false,
      description: "Decentralized finance community",
    },
    {
      id: 3,
      name: "NFT Collectors",
      members: 15200,
      coverImage: "/nft-collection-futuristic.jpg",
      avatar: "/nft-collector-avatar.png",
      isLive: true,
      description: "Rare NFT discoveries daily",
    },
    {
      id: 4,
      name: "Web3 Builders",
      members: 6700,
      coverImage: "/web3-development-code.png",
      avatar: "/developer-avatar.png",
      isLive: false,
      description: "Building the future of web",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {communities.map((community) => (
        <div key={community.id} className="relative group cursor-pointer">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C40]/80 to-[#0B0B2A]/80 backdrop-blur-sm border border-white/10 hover:border-[#00E0FF]/30 transition-all duration-300 group-hover:scale-105">
            <div className="relative h-24 overflow-hidden">
              <img
                src={community.coverImage || "/placeholder.svg"}
                alt={community.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {community.isLive && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#00FFC6]/20 backdrop-blur-sm rounded-full px-2 py-1">
                  <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse"></div>
                  <span className="text-xs text-[#00FFC6] font-medium">
                    LIVE
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <Avatar className="w-8 h-8 border-2 border-[#00E0FF]/50">
                    <AvatarImage
                      src={community.avatar || "/placeholder.svg"}
                      alt={community.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black text-xs font-bold">
                      {community.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {community.isLive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00FFC6] rounded-full border-2 border-[#0B0B2A]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-white truncate">
                    {community.name}
                  </h3>
                  <p className="text-xs text-white/60 truncate">
                    {community.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#00E0FF]">
                <Users className="w-3 h-3" />
                <span className="text-xs font-semibold">
                  {community.members.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00E0FF]/0 via-[#FF1CF7]/0 to-[#00FFC6]/0 group-hover:from-[#00E0FF]/10 group-hover:via-[#FF1CF7]/10 group-hover:to-[#00FFC6]/10 transition-all duration-300 pointer-events-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateSection() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] bg-clip-text text-transparent">
        Create Post
      </h1>
      <p className="text-white/60">Create section coming soon...</p>
    </div>
  );
}

function NFTSection() {
  const [activeNFTTab, setActiveNFTTab] = useState("trending");

  const nftItems = [
    {
      id: 1,
      title: "Cyber Genesis #001",
      creator: {
        name: "Alex Chen",
        username: "@alexcrypto",
        avatar: "/crypto-art-avatar.jpg",
        verified: true,
      },
      image: "/digital-art-neon-cyberpunk.jpg",
      price: "12.5 ETH",
      usdPrice: "$31,250",
      likes: 2847,
      category: "Art",
      rarity: "Legendary",
      bettingOdds: "2.3x",
      hasBetting: true,
      timeLeft: "2d 14h",
      lastSale: "10.2 ETH",
    },
    {
      id: 2,
      title: "Quantum Dreams",
      creator: {
        name: "Maya Rodriguez",
        username: "@mayacollects",
        avatar: "/nft-collector-avatar.png",
        verified: true,
      },
      image: "/nft-collection-futuristic.jpg",
      price: "8.2 ETH",
      usdPrice: "$20,500",
      likes: 1923,
      category: "Digital",
      rarity: "Epic",
      bettingOdds: null,
      hasBetting: false,
      timeLeft: null,
      lastSale: "7.8 ETH",
    },
    {
      id: 3,
      title: "Metaverse Portal",
      creator: {
        name: "Jordan Kim",
        username: "@web3builder",
        avatar: "/developer-avatar.png",
        verified: true,
      },
      image: "/metaverse-virtual-world.png",
      price: "15.7 ETH",
      usdPrice: "$39,250",
      likes: 3456,
      category: "3D",
      rarity: "Mythic",
      bettingOdds: "4.1x",
      hasBetting: true,
      timeLeft: "1d 8h",
      lastSale: "12.3 ETH",
    },
    {
      id: 4,
      title: "DeFi Revolution",
      creator: {
        name: "Sam Wilson",
        username: "@samdefi",
        avatar: "/trading-avatar.jpg",
        verified: false,
      },
      image: "/trading-charts-neon-blue.jpg",
      price: "6.9 ETH",
      usdPrice: "$17,250",
      likes: 1567,
      category: "Finance",
      rarity: "Rare",
      bettingOdds: null,
      hasBetting: false,
      timeLeft: null,
      lastSale: "5.4 ETH",
    },
    {
      id: 5,
      title: "GameFi Legends",
      creator: {
        name: "Riley Chen",
        username: "@rileygames",
        avatar: "/diverse-gaming-avatars.png",
        verified: true,
      },
      image: "/gaming-nft-blockchain.jpg",
      price: "4.3 ETH",
      usdPrice: "$10,750",
      likes: 892,
      category: "Gaming",
      rarity: "Epic",
      bettingOdds: "3.7x",
      hasBetting: true,
      timeLeft: "5d 2h",
      lastSale: "3.1 ETH",
    },
    {
      id: 6,
      title: "Web3 Future",
      creator: {
        name: "Taylor Kim",
        username: "@taylorweb3",
        avatar: "/metaverse-avatar.jpg",
        verified: false,
      },
      image: "/web3-development-code.png",
      price: "9.1 ETH",
      usdPrice: "$22,750",
      likes: 2134,
      category: "Tech",
      rarity: "Legendary",
      bettingOdds: null,
      hasBetting: false,
      timeLeft: null,
      lastSale: "8.7 ETH",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Alex Chen",
      action: "placed a bet on",
      item: "Cyber Genesis #001",
      amount: "2.5 ETH",
      timeAgo: "2m ago",
      avatar: "/crypto-art-avatar.jpg",
    },
    {
      id: 2,
      user: "Maya Rodriguez",
      action: "bought",
      item: "Quantum Dreams",
      amount: "8.2 ETH",
      timeAgo: "5m ago",
      avatar: "/nft-collector-avatar.png",
    },
    {
      id: 3,
      user: "Jordan Kim",
      action: "listed",
      item: "Metaverse Portal",
      amount: "15.7 ETH",
      timeAgo: "12m ago",
      avatar: "/developer-avatar.png",
    },
    {
      id: 4,
      user: "Sam Wilson",
      action: "placed a bet on",
      item: "GameFi Legends",
      amount: "1.2 ETH",
      timeAgo: "18m ago",
      avatar: "/trading-avatar.jpg",
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Mythic":
        return "from-[#FF1CF7] to-[#00E0FF]";
      case "Legendary":
        return "from-[#00FFC6] to-[#00E0FF]";
      case "Epic":
        return "from-[#FF1CF7] to-[#00FFC6]";
      case "Rare":
        return "from-[#00E0FF] to-[#FF1CF7]";
      default:
        return "from-white/20 to-white/10";
    }
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse"></div>
            <span className="text-xs text-[#00FFC6] font-medium">LIVE</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "trending", label: "Trending", icon: Flame },
            { id: "new", label: "New Drops", icon: Sparkles },
            { id: "betting", label: "Live Bets", icon: Zap },
            { id: "categories", label: "Categories", icon: Filter },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveNFTTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 ${
                activeNFTTab === tab.id
                  ? "bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black shadow-lg"
                  : "bg-[#1C1C40]/30 text-white/60 hover:text-white hover:bg-[#1C1C40]/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* NFT Grid */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {nftItems.map((nft) => (
            <div
              key={nft.id}
              className="relative group cursor-pointer bg-gradient-to-br from-[#1C1C40]/40 to-[#0B0B2A]/40 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-[#00E0FF]/40 transition-all duration-300 hover:scale-105"
            >
              {/* NFT Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Rarity Badge */}
                <div
                  className={`absolute top-3 left-3 bg-gradient-to-r ${getRarityColor(
                    nft.rarity
                  )} p-0.5 rounded-full`}
                >
                  <div className="bg-[#0B0B2A] rounded-full px-2 py-1">
                    <span className="text-xs text-white font-bold">
                      {nft.rarity}
                    </span>
                  </div>
                </div>

                {/* Betting Indicator */}
                {nft.hasBetting && (
                  <div className="absolute top-3 right-3 bg-[#FF1CF7]/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#FF1CF7]" />
                    <span className="text-xs text-[#FF1CF7] font-bold">
                      {nft.bettingOdds}
                    </span>
                  </div>
                )}

                {/* Time Left for Betting */}
                {nft.hasBetting && nft.timeLeft && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00FFC6]" />
                    <span className="text-xs text-[#00FFC6] font-medium">
                      {nft.timeLeft}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-3 py-2">
                    <div className="text-[#00FFC6] text-sm font-bold">
                      {nft.price}
                    </div>
                    <div className="text-white/60 text-xs">{nft.usdPrice}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title and Category */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-sm truncate flex-1">
                    {nft.title}
                  </h3>
                  <div className="bg-[#00E0FF]/20 rounded-full px-2 py-0.5 ml-2">
                    <span className="text-xs text-[#00E0FF] font-medium">
                      {nft.category}
                    </span>
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="w-6 h-6 border border-[#00E0FF]/30">
                    <AvatarImage
                      src={nft.creator.avatar || "/placeholder.svg"}
                      alt={nft.creator.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black text-xs font-bold">
                      {nft.creator.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/80 truncate">
                        {nft.creator.name}
                      </span>
                      {nft.creator.verified && (
                        <Star className="w-3 h-3 text-[#00FFC6]" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF1CF7]">
                    <Heart className="w-3 h-3" />
                    <span className="text-xs font-semibold">
                      {nft.likes.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {nft.hasBetting ? (
                    <>
                      <Button className="flex-1 bg-gradient-to-r from-[#FF1CF7] to-[#00E0FF] text-white font-bold rounded-2xl h-9 text-xs shadow-lg shadow-[#FF1CF7]/25">
                        <Zap className="w-3 h-3 mr-1" />
                        Place Bet
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border border-[#00FFC6]/30 bg-[#00FFC6]/10 text-[#00FFC6] font-bold rounded-2xl h-9 text-xs hover:bg-[#00FFC6]/20"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Buy Now
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full bg-gradient-to-r from-[#00E0FF] to-[#00FFC6] text-black font-bold rounded-2xl h-9 text-xs shadow-lg shadow-[#00E0FF]/25">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Buy NFT
                    </Button>
                  )}
                </div>

                {/* Last Sale */}
                <div className="mt-2 text-center">
                  <span className="text-xs text-white/40">Last sale: </span>
                  <span className="text-xs text-white/60 font-semibold">
                    {nft.lastSale}
                  </span>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00E0FF]/0 via-[#FF1CF7]/0 to-[#00FFC6]/0 group-hover:from-[#00E0FF]/10 group-hover:via-[#FF1CF7]/10 group-hover:to-[#00FFC6]/10 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-gradient-to-br from-[#1C1C40]/30 to-[#0B0B2A]/30 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#00E0FF]" />
            <h2 className="text-lg font-bold text-white">Live Activity</h2>
            <div className="w-2 h-2 bg-[#00FFC6] rounded-full animate-pulse ml-2"></div>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 bg-[#1C1C40]/20 rounded-2xl border border-white/5"
              >
                <Avatar className="w-8 h-8 border border-[#00E0FF]/30">
                  <AvatarImage
                    src={activity.avatar || "/placeholder.svg"}
                    alt={activity.user}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] text-black text-xs font-bold">
                    {activity.user[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold text-white truncate">
                      {activity.user}
                    </span>
                    <span className="text-white/60">{activity.action}</span>
                    <span className="font-semibold text-[#00E0FF] truncate">
                      {activity.item}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[#00FFC6] font-bold">
                      {activity.amount}
                    </span>
                    <span className="text-xs text-white/40">
                      {activity.timeAgo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {activity.action.includes("bet") ? (
                    <Zap className="w-4 h-4 text-[#FF1CF7]" />
                  ) : activity.action.includes("bought") ? (
                    <ShoppingCart className="w-4 h-4 text-[#00FFC6]" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-[#00E0FF]" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <Button
            variant="outline"
            className="w-full mt-4 border border-[#00E0FF]/30 bg-[#00E0FF]/10 text-[#00E0FF] font-semibold rounded-2xl h-10 hover:bg-[#00E0FF]/20"
          >
            View All Activity
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#00E0FF] to-[#FF1CF7] bg-clip-text text-transparent">
        Profile
      </h1>
      <p className="text-white/60">Profile section coming soon...</p>
    </div>
  );
}
