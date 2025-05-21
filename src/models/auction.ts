import { Bid } from "./bid";

export class Auction {
  private status: "open" | "closed" = "open";

  constructor(
    private id: string,
    private endDate: Date,
    private startingPrice: number,
    private bids: Bid[] = [],
  ) {
    if (this.startingPrice <= 0) {
      throw new Error("Starting price must be greater than zero.");
    }

    if (this.endDate < new Date()) {
      throw new Error("End date must be in the future.");
    }
  }

  placeBid(bid: Bid) {
    if (bid.amount <= this.getCurrentPrice()) {
      throw new Error("Bid amount must be higher than the current price.");
    }

    if (bid.date > this.endDate) {
      throw new Error("Bid date must be within the auction period.");
    }

    this.bids.push(bid);
  }

  finishAuction() {
    if (this.status !== "open") {
      throw new Error("Auction is not open.");
    }

    if (this.endDate < new Date()) {
      this.status = "closed";
    } else {
      throw new Error("Auction is not finished yet.");
    }

    this.status = "closed";
  }

  getCurrentBid(): Bid | undefined {
    return this.bids.at(-1);
  }

  getCurrentPrice(): number {
    return this.bids.length > 0
      ? this.bids[this.bids.length - 1].amount
      : this.startingPrice;
  }

  getBids(): Bid[] {
    return this.bids;
  }

  getId(): string {
    return this.id;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  getStatus(): "open" | "closed" | "planned" {
    return this.status;
  }
}
