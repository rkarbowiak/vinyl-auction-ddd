import { describe, beforeEach, it, expect } from "bun:test";
import { Auction } from "../src/models/auction";
import { FinishAuctionUseCase } from "../src/use-cases/auction-finished-use-case";
import { BidPlacedUseCase } from "../src/use-cases/bid-placed-use-case";
import { NotificationService } from "../src/interfaces/notification.interface";
import {
  InMemoryAuctionRepository,
  InMemoryVinylCollectionRepository,
} from "./adapters/in-memory-repositories";

class SendNotificationAdapter implements NotificationService {
  public bidPlacedNotifications: string[] = [];
  public overbidNotifications: string[] = [];

  async sendBidPlacedNotification(recipient: string): Promise<void> {
    console.log(`Bid placed notification sent to ${recipient}`);
    this.bidPlacedNotifications.push(recipient);
  }

  async sendOverbidNotification(recipient: string): Promise<void> {
    console.log(`Overbid notification sent to ${recipient}`);
    this.overbidNotifications.push(recipient);
  }
}

describe("Auction End-to-End Flow", () => {
  let auctionRepo: InMemoryAuctionRepository;
  let vinylCollectionRepo: InMemoryVinylCollectionRepository;
  let finishAuctionUseCase: FinishAuctionUseCase;
  let bidPlacedUseCase: BidPlacedUseCase;
  let notificationService: SendNotificationAdapter;

  beforeEach(() => {
    auctionRepo = new InMemoryAuctionRepository();
    vinylCollectionRepo = new InMemoryVinylCollectionRepository();
    notificationService = new SendNotificationAdapter();

    bidPlacedUseCase = new BidPlacedUseCase(
      auctionRepo,
      vinylCollectionRepo,
      notificationService,
    );
    bidPlacedUseCase.setupSubscriptions();

    finishAuctionUseCase = new FinishAuctionUseCase(
      auctionRepo,
      vinylCollectionRepo,
    );
    finishAuctionUseCase.setupSubscriptions();
  });

  it("should place bid and send emails", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const sellerId = "seller123";
    const vinylId = "vinyl123";
    const auctionId = "auction123";
    const startingPrice = 100;

    const auction = new Auction(
      auctionId,
      futureDate,
      startingPrice,
      sellerId,
      vinylId,
    );

    await auctionRepo.save(auction);

    const firstBidderId = "bidder1";
    const firstBidAmount = 150;

    const firstBidResult = await bidPlacedUseCase.execute({
      auctionId,
      bidDto: {
        userId: firstBidderId,
        amount: firstBidAmount,
      },
    });

    expect(firstBidResult.isSuccess).toBe(true);

    expect(notificationService.bidPlacedNotifications).toContain(firstBidderId);
    expect(notificationService.overbidNotifications.length).toBe(0);

    const secondBidderId = "bidder2";
    const secondBidAmount = 200;

    notificationService.bidPlacedNotifications = [];
    notificationService.overbidNotifications = [];

    const secondBidResult = await bidPlacedUseCase.execute({
      auctionId,
      bidDto: {
        userId: secondBidderId,
        amount: secondBidAmount,
      },
    });

    expect(secondBidResult.isSuccess).toBe(true);

    expect(notificationService.bidPlacedNotifications).toContain(
      secondBidderId,
    );
    expect(notificationService.overbidNotifications).toContain(firstBidderId);
    const updatedAuction = await auctionRepo.getById(auctionId);
    expect(updatedAuction).toBeDefined();
    const bids = (updatedAuction as Auction).getBids();
    expect(bids.length).toBe(2);
    expect(bids[0]?.bidderId).toBe(firstBidderId);
    expect(bids[0]?.amount).toBe(firstBidAmount);
    expect(bids[1]?.bidderId).toBe(secondBidderId);
    expect(bids[1]?.amount).toBe(secondBidAmount);
  });

  it("should fail when trying to bid on non-existent auction", async () => {
    const nonExistentAuctionId = "non-existent-auction";
    const bidderId = "bidder1";

    const result = await bidPlacedUseCase.execute({
      auctionId: nonExistentAuctionId,
      bidDto: {
        userId: bidderId,
        amount: 200,
      },
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBe("Auction not found");

    expect(notificationService.bidPlacedNotifications.length).toBe(0);
    expect(notificationService.overbidNotifications.length).toBe(0);
  });

  it("should fail when bid amount is too low", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const auctionId = "auction456";
    const startingPrice = 100;

    const auction = new Auction(
      auctionId,
      futureDate,
      startingPrice,
      "seller123",
      "vinyl456",
    );

    await auctionRepo.save(auction);

    const result = await bidPlacedUseCase.execute({
      auctionId,
      bidDto: {
        userId: "bidder1",
        amount: 50,
      },
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBe(
      "Bid amount must be higher than the current price.",
    );

    expect(notificationService.bidPlacedNotifications.length).toBe(0);
    expect(notificationService.overbidNotifications.length).toBe(0);
  });

  it("should fail when seller tries to bid on their own auction", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const sellerId = "seller789";
    const auctionId = "auction789";
    const startingPrice = 100;

    const auction = new Auction(
      auctionId,
      futureDate,
      startingPrice,
      sellerId,
      "vinyl789",
    );

    await auctionRepo.save(auction);

    const result = await bidPlacedUseCase.execute({
      auctionId,
      bidDto: {
        userId: sellerId,
        amount: 150,
      },
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBe("Seller cannot bid on their own auction");

    expect(notificationService.bidPlacedNotifications.length).toBe(0);
    expect(notificationService.overbidNotifications.length).toBe(0);
  });
});
