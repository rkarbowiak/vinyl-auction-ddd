import { Vinyl } from "./vinyl";

export class VinylCollection {
  constructor(private id: string = crypto.randomUUID()) {}

  private vinyls: Vinyl[] = [];

  addVinyl(vinyl: Vinyl) {
    vinyl.setCollectionId(this.id);
    this.vinyls.push(vinyl);
  }

  getVinyls(): any {
    return this.vinyls;
  }

  removeVinyl(vinyl: Vinyl) {
    const index = this.vinyls.indexOf(vinyl);

    if (index > -1) {
      this.vinyls.splice(index, 1);
    }
  }

  updateVinyl(id: string, vinyl: { title: string; artist: string }) {
    const index = this.vinyls.findIndex((v) => v.getId() === id);

    if (index > -1) {
      this.vinyls[index].setTitle(vinyl.title);
      this.vinyls[index].setArtist(vinyl.artist);
    }
  }

  getVinylById(id: string): Vinyl | undefined {
    return this.vinyls.find((vinyl) => vinyl.getId() === id);
  }

  getId(): string {
    return this.id;
  }

  setId(id: string): void {
    this.id = id;
  }
}
