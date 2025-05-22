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

  private async onAuctionFinished(event: DomainEvent): Promise<void> {
    if (!(event instanceof AuctionFinishedEvent)) {
      return;
    }

    const { vinylId, sellerId, winnerId } = event;

    if (!winnerId) {
      return;
    }

    const auction = await this.auctionRepo.getAuction(event.auctionId);

    if (!auction) {
      throw new Error("Auction not found");
    }

    if (!auction.isFinished()) {
      throw new Error("Auction is not finished");
    }

    const sellerCollection = await this.vinylCollectionRepo.getById(sellerId);

    const winnerCollection = await this.vinylCollectionRepo.getById(winnerId);

    if (!sellerCollection || !winnerCollection) {
      throw new Error("Vinyl collection not found");
    }

    const removeVinylResponse = sellerCollection.removeVinylById(vinylId);

    if (removeVinylResponse.isFailure) {
      throw new Error(removeVinylResponse.getError());
    }

    const addVinylResponse = winnerCollection.addVinyl(
      removeVinylResponse.getValue(),
    );

    if (addVinylResponse.isFailure) {
      throw new Error(addVinylResponse.getError());
    }

    // Transactional boundary
    await this.vinylCollectionRepo.save(winnerCollection);
    await this.vinylCollectionRepo.save(sellerCollection);
    // Done!
  }

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

    await DomainEvents.dispatchEventsForAggregate(request.auctionId);

    return Result.ok<void>();
  }
}
