import { AggregateRoot } from "../events/aggragate-root";
import { AuctionFinishedEvent } from "../events/events/auction-finished";
import { BidPlacedEvent } from "../events/events/bid-placed";
import { Result } from "../result";
import { Bid } from "./bid";

export class Auction extends AggregateRoot<Auction> {
  private status: "open" | "closed" = "open";

  constructor(
    id: string,
    private endDate: Date,
    private startingPrice: number,
    private sellerId: string,
    private vinylId: string,
    private bids: Bid[] = [],
  ) {
    super(id);

    if (this.startingPrice <= 0) {
      throw new Error("Starting price must be greater than zero.");
    }

    if (this.endDate < new Date()) {
      throw new Error("End date must be in the future.");
    }
  }

  placeBid(bid: Bid): Result<Bid> {
    if (bid.amount <= this.getCurrentPrice().getValue()) {
      return Result.fail("Bid amount must be higher than the current price.");
    }

    if (bid.date > this.endDate) {
      return Result.fail("Bid date must be within the auction period.");
    }

    if (this.status !== "open") {
      return Result.fail("Auction is not open");
    }

    if (this.sellerId === bid.bidderId) {
      return Result.fail("Seller cannot bid on their own auction");
    }

    const lastBid = this.bids.at(-1);

    this.bids.push(bid);

    this.addDomainEvent(
      new BidPlacedEvent(this.id, bid.bidderId, lastBid?.bidderId),
    );

    return Result.ok(bid);
  }

  finish(): Result<Auction> {
    if (this.status !== "open") {
      return Result.fail("Auction is not open.");
    }

    if (this.endDate > new Date()) {
      return Result.fail("Auction is not finished yet.");
    }

    this.status = "closed";
    return Result.ok(this);
  }

  getCurrentBid(): Result<Bid> {
    return Result.ok(this.bids.at(-1));
  }

  getCurrentPrice(): Result<number> {
    return Result.ok(
      this.bids.length > 0
        ? this.bids[this.bids.length - 1].amount
        : this.startingPrice,
    );
  }

  isFinished() {
    return this.status === "closed";
  }

  getBids(): Bid[] {
    return this.bids;
  }

  getId(): String {
    return this.id;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  getStatus(): "open" | "closed" | "planned" {
    return this.status;
  }

  getSellerId(): string {
    return this.sellerId;
  }

  getVinylId(): string {
    return this.vinylId;
  }
}
