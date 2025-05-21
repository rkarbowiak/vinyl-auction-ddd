import { DomainEvents } from "../events/domain-events";
import { AuctionFinishedEvent } from "../events/events/auction-finished";
import { BidPlacedEvent } from "../events/events/bid-placed";
import { DomainEvent } from "../interfaces/domain-event.interface";
import { NotificationService } from "../interfaces/notification.interface";
import {
  AuctionRepository,
  VinylCollectionRepository,
} from "../interfaces/repositories.interface";
import { Bid } from "../models/bid";
import { Result } from "../result";

export class BidPlacedUseCase {
  private auctionRepo: AuctionRepository;
  private vinylCollectionRepo: VinylCollectionRepository;
  private notificationService: NotificationService;

  constructor(
    auctionRepo: AuctionRepository,
    vinylCollectionRepo: VinylCollectionRepository,
    notificationService: NotificationService,
  ) {
    this.auctionRepo = auctionRepo;
    this.vinylCollectionRepo = vinylCollectionRepo;
    this.notificationService = notificationService;
  }

  setupSubscriptions() {
    DomainEvents.register(this.onBidPlaced.bind(this), BidPlacedEvent.name);
  }

  private async onBidPlaced(event: DomainEvent): Promise<void> {
    if (!(event instanceof BidPlacedEvent)) {
      return;
    }

    const { newBidUserId, previousBidUserId } = event;

    this.notificationService.sendBidPlacedNotification(newBidUserId);

    if (previousBidUserId) {
      this.notificationService.sendOverbidNotification(previousBidUserId);
    }
  }

  async execute(request: {
    auctionId: string;
    bidDto: {
      userId: string;
      amount: number;
    };
  }): Promise<Result<void>> {
    const auction = await this.auctionRepo.getById(request.auctionId);
    if (!auction) {
      return Result.fail<void>("Auction not found");
    }

    const result = auction.placeBid(
      Bid.create(request.bidDto.userId, request.bidDto.amount),
    );

    if (result.isFailure) {
      return Result.fail<void>(result.getError());
    }

    await this.auctionRepo.save(auction);

    DomainEvents.dispatchEventsForAggregate(request.auctionId);

    return Result.ok<void>();
  }
}
