import { describe, expect, it } from "bun:test";

class Vinyl {
  constructor(private id: string, private title: string) {}

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public setId(id: string): void {
    this.id = id;
  }

  public setTitle(title: string): void {
    this.title = title;
  }
}

class VinylCollection {
  private vinyls: Vinyl[] = [];

  addVinyl(vinyl: Vinyl) {
    this.vinyls.push(vinyl);
  }

  getVinyl(vinyl: Vinyl) {
    return this.vinyls.find((v) => v.getId() === vinyl.getId());
  }

  getVinyls() {
    return this.vinyls;
  }
}

describe("Vinyl Collection", () => {
  it("should create a vinyl collection", () => {
    const vinyl = new VinylCollection();

    expect(vinyl).toBeInstanceOf(VinylCollection);
  });

  it("should add a vinyl to the collection", () => {
    const vinylCollection = new VinylCollection();
    const id = crypto.randomUUID();
    const title = "Bohemian Rhapsody";
    const vinyl = new Vinyl(id, title);
    vinylCollection.addVinyl(vinyl);

    const vinyl2 = new Vinyl(id, title);

    const addedVinyl = vinylCollection.getVinyl(vinyl2);

    expect(addedVinyl).toBeDefined();
    expect(vinylCollection.getVinyls()).toHaveLength(1);
    expect(vinylCollection.getVinyls()).toContain(addedVinyl);
  });
});
