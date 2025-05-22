import { describe, beforeEach, it, expect, setSystemTime } from "bun:test";
import { Auction } from "../src/models/auction";
import { Bid } from "../src/models/bid";
import { Vinyl } from "../src/models/vinyl";
import { VinylCollection } from "../src/models/vinyl-collection";
import { FinishAuctionUseCase } from "../src/use-cases/auction-finished-use-case";
import {
  InMemoryAuctionRepository,
  InMemoryVinylCollectionRepository,
} from "./adapters/in-memory-repositories";

describe("Auction End-to-End Flow", () => {
  let auctionRepo: InMemoryAuctionRepository;
  let vinylCollectionRepo: InMemoryVinylCollectionRepository;
  let finishAuctionUseCase: FinishAuctionUseCase;

  beforeEach(() => {
    auctionRepo = new InMemoryAuctionRepository();
    vinylCollectionRepo = new InMemoryVinylCollectionRepository();
    finishAuctionUseCase = new FinishAuctionUseCase(
      auctionRepo,
      vinylCollectionRepo,
    );
    finishAuctionUseCase.setupSubscriptions();
  });

  it("should complete the entire auction flow correctly", async () => {
    setSystemTime(new Date("2023-10-31T23:59:59Z"));

    const vinylId = "vinyl-1";
    const sellerId = "seller-1";
    const buyerId = "buyer-1";
    const auctionId = "auction-1";

    const sellerCollection = new VinylCollection("seller-collection");
    sellerCollection.setId(sellerId);

    const vinyl = new Vinyl(
      vinylId,
      "November Rain",
      "Guns N' Roses",
      sellerCollection.getId(),
    );

    sellerCollection.addVinyl(vinyl);

    const buyerCollection = new VinylCollection(buyerId);

    await vinylCollectionRepo.save(sellerCollection);
    await vinylCollectionRepo.save(buyerCollection);

    const auctionEndDate = new Date("2023-11-02T23:59:59Z");
    const auction = new Auction(
      auctionId,
      auctionEndDate,
      100,
      sellerId,
      vinylId,
    );

    const bidId = crypto.randomUUID();
    const bid = new Bid(bidId, buyerId, 200, new Date("2023-11-01T23:59:59Z"));
    auction.placeBid(bid);

    await auctionRepo.save(auction);

    setSystemTime(new Date("2023-11-03T00:00:00Z"));
    const result = await finishAuctionUseCase.execute({
      auctionId: auctionId,
    });

    expect(result.isSuccess).toBe(true);

    const finishedAuction = await auctionRepo.getById(auctionId);
    const updatedSellerCollection = await vinylCollectionRepo.getById(sellerId);
    const updatedBuyerCollection = await vinylCollectionRepo.getById(buyerId);

    expect(finishedAuction).toBeDefined();
    expect(finishedAuction?.isFinished()).toBe(true);
    expect(updatedSellerCollection?.getVinyls().length).toBe(0);
    expect(updatedBuyerCollection?.getVinyls().length).toBe(1);
    expect(updatedBuyerCollection?.getVinyls()[0].getId()).toBe("vinyl-1");
  });
});
