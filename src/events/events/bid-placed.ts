import { DomainEvent } from "../../interfaces/domain-event.interface";

export class BidPlacedEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  public readonly auctionId: string;
  public readonly newBidUserId: string;
  public readonly previousBidUserId: string | undefined;
  constructor(
    auctionId: string,
    newBidUserId: string,
    previousBidUserId: string | undefined,
  ) {
    this.auctionId = auctionId;
    this.newBidUserId = newBidUserId;
    this.previousBidUserId = previousBidUserId;
  }

  getAggregateId(): string {
    return this.auctionId;
  }
}
