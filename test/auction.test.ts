import { beforeEach, describe, expect, it, setSystemTime } from "bun:test";
import { Auction } from "../src/models/auction";
import { Bid } from "../src/models/bid";

const createAuction = (
  id: string = crypto.randomUUID(),
  endDate: Date = new Date("2023-10-31T23:59:59Z"),
  sellerId: string = crypto.randomUUID(),
  startingPrice: number = 100,
  vinylId: string = crypto.randomUUID(),
) => {
  return new Auction(id, endDate, startingPrice, sellerId, vinylId);
};

const mockDate = new Date("2023-10-01T00:00:00Z");

describe("auction", () => {
  beforeEach(() => {
    setSystemTime(mockDate);
  });

  it("should create an auction", () => {
    const id = crypto.randomUUID();
    const auction = createAuction(
      id,
      new Date("2023-10-31T23:59:59Z"),
      "seller-id",
      100,
      "vinyl-id",
    );

    expect(auction).toBeInstanceOf(Auction);
    expect(auction.getBids()).toHaveLength(0);
    expect(auction.getId()).toBe(id);
    expect(auction.getStatus()).toBe("open");
    expect(auction.getEndDate()).toEqual(new Date("2023-10-31T23:59:59Z"));
    expect(auction.getSellerId()).toBe("seller-id");
    expect(auction.getVinylId()).toBe("vinyl-id");
  });

  it("should place a bid to the auction", () => {
    const auction = createAuction();

    const id = crypto.randomUUID();
    const bid = new Bid(id, "bidder1", 150);
    auction.placeBid(bid);

    expect(auction.getCurrentBid().getValue()).toBe(bid);
    expect(auction.getBids()).toHaveLength(1);
    expect(auction.getBids()[0]).toBe(bid);
    expect(auction.getCurrentPrice().getValue()).toBe(150);
  });

  it("should not place a bid lower than the current price", () => {
    const auction = createAuction();

    const id = crypto.randomUUID();
    const bid = new Bid(id, "bidder1", 50);

    const response = auction.placeBid(bid);

    expect(response.isFailure).toBe(true);
    expect(response.getError()).toBe(
      "Bid amount must be higher than the current price.",
    );
  });

  it("should not place a bid outside the auction period", () => {
    const auction = createAuction();

    const id = crypto.randomUUID();
    const bid = new Bid(id, "bidder1", 150, new Date("2024-11-01T00:00:00Z"));

    const response = auction.placeBid(bid);

    expect(response.isFailure).toBe(true);
    expect(response.getError()).toBe(
      "Bid date must be within the auction period.",
    );
  });

  it("should get the current bid", () => {
    const auction = createAuction();

    const id1 = crypto.randomUUID();
    const bid1 = new Bid(id1, "bidder1", 150);
    auction.placeBid(bid1);

    const id2 = crypto.randomUUID();
    const bid2 = new Bid(id2, "bidder2", 200);
    auction.placeBid(bid2);

    expect(auction.getCurrentBid().getValue()).toBe(bid2);
    expect(auction.getCurrentPrice().getValue()).toBe(200);
  });

  it("should end the auction", () => {
    const auction = createAuction();

    const id1 = crypto.randomUUID();
    const bid1 = new Bid(id1, "bidder1", 150);
    auction.placeBid(bid1);

    const id2 = crypto.randomUUID();
    const bid2 = new Bid(id2, "bidder2", 200);
    auction.placeBid(bid2);

    setSystemTime(new Date("2024-10-31T23:59:59Z"));
    const response = auction.finish();

    expect(response.isSuccess).toBe(true);
    expect(auction.getCurrentBid().getValue()).toBe(bid2);
    expect(auction.getCurrentPrice().getValue()).toBe(200);
    expect(auction.getBids()).toHaveLength(2);
    expect(auction.getStatus()).toBe("closed");
  });

  it("should not end the auction if it is not finished yet", () => {
    const auction = createAuction();

    const response = auction.finish();

    expect(response.isFailure).toBe(true);
    expect(response.getError()).toBe("Auction is not finished yet.");
  });

  it("should not end the auction if it is already closed", () => {
    const auction = createAuction();

    const id1 = crypto.randomUUID();
    const bid1 = new Bid(id1, "bidder1", 150);
    auction.placeBid(bid1);

    setSystemTime(new Date("2024-10-31T23:59:59Z"));

    const finishAuctionSuccess = auction.finish();

    expect(finishAuctionSuccess.isSuccess).toBe(true);
    expect(auction.getStatus()).toBe("closed");

    const response = auction.finish();

    expect(response.isFailure).toBe(true);
    expect(response.getError()).toBe("Auction is not open.");
  });
});
