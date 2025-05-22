import { AggregateRoot } from "../events/aggragate-root";
import { Result } from "../result";
import { Vinyl } from "./vinyl";

export class VinylCollection extends AggregateRoot<VinylCollection> {
  constructor(id: string = crypto.randomUUID()) {
    super(id);
  }

  private vinyls: Vinyl[] = [];

  addVinyl(vinyl: Vinyl): Result<Vinyl> {
    vinyl.setCollectionId(this.id);
    this.vinyls.push(vinyl);

    return Result.ok(vinyl);
  }

  getVinyls(): any {
    return this.vinyls;
  }

  removeVinyl(vinyl: Vinyl): Result<Vinyl> {
    const index = this.vinyls.indexOf(vinyl);

    if (index > -1) {
      this.vinyls.splice(index, 1);
    }

    return Result.ok(vinyl);
  }

  removeVinylById(id: string): Result<Vinyl> {
    const foundVinyl = this.getVinylById(id);

    if (foundVinyl.isFailure) {
      return Result.fail("Vinyl not found");
    }

    const index = this.vinyls.indexOf(foundVinyl.getValue());
    this.vinyls.splice(index, 1);

    return Result.ok(foundVinyl.getValue());
  }

  updateVinyl(
    id: string,
    vinyl: { title: string; artist: string },
  ): Result<Vinyl> {
    const foundVinyl = this.getVinylById(id);

    if (foundVinyl.isFailure) {
      return Result.fail("Vinyl not found");
    }

    const index = this.vinyls.indexOf(foundVinyl.getValue());
    this.vinyls[index].setTitle(vinyl.title);
    this.vinyls[index].setArtist(vinyl.artist);

    return Result.ok(this.vinyls[index]);
  }

  getVinylById(id: string): Result<Vinyl> {
    const vinyl = this.vinyls.find((vinyl) => vinyl.getId() === id);

    if (!vinyl) {
      return Result.fail("Vinyl not found");
    }

    return Result.ok(vinyl);
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }
}
