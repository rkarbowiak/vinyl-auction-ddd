import { DomainEvent } from "../../interfaces/domain-event.interface";

export class AuctionFinishedEvent implements DomainEvent {
  dateTimeOccurred: Date = new Date();
  public readonly auctionId: string;
  public readonly vinylId: string;
  public readonly sellerId: string;
  public readonly winnerId?: string;

  constructor(
    auctionId: string,
    vinylId: string,
    sellerId: string,
    winnerId?: string,
  ) {
    this.auctionId = auctionId;
    this.vinylId = vinylId;
    this.sellerId = sellerId;
    this.winnerId = winnerId;
  }

  getAggregateId(): string {
    return this.auctionId;
  }
}
