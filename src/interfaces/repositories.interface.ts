import { Auction } from "../models/auction";
import { VinylCollection } from "../models/vinyl-collection";

export interface VinylCollectionRepository {
  getByUserId(userId: String): Promise<VinylCollection | undefined>;
  save(collection: VinylCollection): Promise<void>;
}

export interface AuctionRepository {
  getById(id: String): Promise<Auction | undefined>;
  getAuction(id: String): Promise<Auction | undefined>;
  save(auction: Auction): Promise<void>;
}
