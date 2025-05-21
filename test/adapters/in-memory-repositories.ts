import {
  AuctionRepository,
  VinylCollectionRepository,
} from "../../src/interfaces/repositories.interface";
import { Auction } from "../../src/models/auction";
import { VinylCollection } from "../../src/models/vinyl-collection";

export class InMemoryAuctionRepository implements AuctionRepository {
  private auctions: Map<string, Auction> = new Map();

  async getById(id: string): Promise<Auction | undefined> {
    return this.auctions.get(id) || undefined;
  }

  async getAuction(id: string): Promise<Auction | undefined> {
    return this.getById(id);
  }

  async save(auction: Auction): Promise<void> {
    this.auctions.set(auction.getId() as string, auction);
  }
}

export class InMemoryVinylCollectionRepository
  implements VinylCollectionRepository
{
  private collections: Map<string, VinylCollection> = new Map();

  async getByUserId(userId: string): Promise<VinylCollection | undefined> {
    // Find the first collection for this user
    for (const collection of this.collections.values()) {
      if (collection.getId() === userId) {
        return collection;
      }
    }
    return undefined;
  }

  async save(collection: VinylCollection): Promise<void> {
    this.collections.set(collection.getId(), collection);
  }
}
