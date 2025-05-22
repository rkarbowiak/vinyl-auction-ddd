import { DomainEvents } from "../events/domain-events";
import { AuctionFinishedEvent } from "../events/events/auction-finished";
import { DomainEvent } from "../interfaces/domain-event.interface";
import {
  AuctionRepository,
  VinylCollectionRepository,
} from "../interfaces/repositories.interface";
import { Result } from "../result";

export class FinishAuctionUseCase {
  private auctionRepo: AuctionRepository;
  private vinylCollectionRepo: VinylCollectionRepository;

  constructor(
    auctionRepo: AuctionRepository,
    vinylCollectionRepo: VinylCollectionRepository,
  ) {
    this.auctionRepo = auctionRepo;
    this.vinylCollectionRepo = vinylCollectionRepo;
  }

  setupSubscriptions() {
    DomainEvents.register(
      this.onAuctionFinished.bind(this),
      AuctionFinishedEvent.name,
    );
  }

  private async onAuctionFinished(event: DomainEvent): Promise<void> {}

  async execute(request: { auctionId: string }): Promise<Result<void>> {
    const auction = await this.auctionRepo.getById(request.auctionId);
    if (!auction) {
      return Result.fail<void>("Auction not found");
    }

    const result = auction.finish();

    if (result.isFailure) {
      return Result.fail<void>(result.getError());
    }

    await this.auctionRepo.save(auction);

    DomainEvents.dispatchEventsForAggregate(request.auctionId);

    return Result.ok<void>();
  }
}
