import { describe, it, expect, beforeEach } from "bun:test";

class Bid {
  constructor(
    private id: string,
    private amount: number,
    private bidderId: string,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getBidderId(): string {
    return this.bidderId;
  }
}

class Auction {
  private bids: Bid[] = [];

  constructor(private ownerId: string, private endDate: Date = new Date()) {}

  placeBid(bid: Bid) {
    if (this.bids.length > 0 && bid.getAmount() <= this.getCurrentBid()) {
      throw new Error("Bid amount must be higher than the current bid.");
    }

    if (this.endDate < new Date()) {
      throw new Error("Auction has already ended.");
    }

    if (this.ownerId === bid.getBidderId()) {
      throw new Error("Seller cannot bid on their own auction");
    }

    this.bids.push(bid);
  }

  getCurrentBid(): number {
    return this.bids.length > 0
      ? this.bids[this.bids.length - 1].getAmount()
      : 0;
  }

  setOwnerId(ownerId: string) {
    this.ownerId = ownerId;
  }

  getOwnerId(): string {
    return this.ownerId;
  }
}

describe("auction test", () => {
  const ownerId = "owner-1";
  let auction: Auction;

  beforeEach(() => {
    auction = new Auction(ownerId);
  });

  it("should create vinyl auction", () => {
    expect(auction).toBeInstanceOf(Auction);
  });

  it("should place bid for an auction", () => {
    auction.placeBid(new Bid("bid-1", 100, "user-1"));

    expect(auction.getCurrentBid()).toBe(100);
  });

  it("should place multiple bids for an auction", () => {
    auction.placeBid(new Bid("bid-1", 100, "user-1"));
    auction.placeBid(new Bid("bid-2", 150, "user-2"));

    expect(auction.getCurrentBid()).toBe(150);
  });

  it("should not allow bid lower than current bid", () => {
    auction.placeBid(new Bid("bid-1", 100, "user-1"));

    expect(() => {
      auction.placeBid(new Bid("bid-2", 50, "user-2"));
    }).toThrow("Bid amount must be higher than the current bid.");
  });

  it("should not allow bid after auction end date", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const auction = new Auction(ownerId, pastDate);

    expect(() => {
      auction.placeBid(new Bid("bid-1", 100, "user-1"));
    }).toThrow("Auction has already ended.");
  });

  it("should not allow bid on own auction", () => {
    auction.setOwnerId("seller-1");

    const sellerId = "seller-1";
    const bid = new Bid("bid-1", 100, sellerId);

    try {
      auction.placeBid(bid);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe("Seller cannot bid on their own auction");
    }
  });

  it("should finish an auction", () => {});
});
