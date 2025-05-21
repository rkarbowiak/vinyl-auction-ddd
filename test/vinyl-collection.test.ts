import { describe, expect, it } from "bun:test";
import { VinylCollection } from "../src/models/vinyl-collection";
import { Vinyl } from "../src/models/vinyl";

describe("vinyl collection", () => {
  it("should create a vinyl collection", () => {
    const collection = new VinylCollection();
    expect(collection).toBeInstanceOf(VinylCollection);
  });

  it("should add a vinyl to the collection", () => {
    const collection = new VinylCollection();
    const vinyl = new Vinyl(
      crypto.randomUUID(),
      "November Rain",
      "Guns N' Roses",
    );

    collection.addVinyl(vinyl);

    expect(collection.getVinyls()).toHaveLength(1);
    expect(collection.getVinyls()[0]).toBe(vinyl);
    expect(vinyl.getCollectionId()).toBe(collection.getId());
  });

  it("should add multiple vinyls to the collection", () => {
    const collection = new VinylCollection();
    const vinyl1 = new Vinyl(crypto.randomUUID(), "Back in Black", "AC/DC");
    const vinyl2 = new Vinyl(
      crypto.randomUUID(),
      "The Dark Side of the Moon",
      "Pink Floyd",
    );

    collection.addVinyl(vinyl1);
    collection.addVinyl(vinyl2);

    expect(collection.getVinyls()).toHaveLength(2);
    expect(collection.getVinyls()[0]).toBe(vinyl1);
    expect(collection.getVinyls()[1]).toBe(vinyl2);
    expect(vinyl1.getCollectionId()).toBe(collection.getId());
    expect(vinyl2.getCollectionId()).toBe(collection.getId());
  });

  it("should return an empty array when no vinyls are added", () => {
    const collection = new VinylCollection();

    expect(collection.getVinyls()).toHaveLength(0);
  });

  it("should remove a vinyl from the collection", () => {
    const collection = new VinylCollection();
    const vinyl1 = new Vinyl(
      crypto.randomUUID(),
      "Stairway to Heaven",
      "Led Zeppelin",
    );
    const vinyl2 = new Vinyl(crypto.randomUUID(), "Hotel California", "Eagles");

    collection.addVinyl(vinyl1);
    collection.addVinyl(vinyl2);

    collection.removeVinyl(vinyl1);

    expect(collection.getVinyls()).toHaveLength(1);
    expect(collection.getVinyls()[0]).toBe(vinyl2);
  });

  it("should not remove a vinyl that is not in the collection", () => {
    const collection = new VinylCollection();
    const vinyl1 = new Vinyl(
      crypto.randomUUID(),
      "Billie Jean",
      "Michael Jackson",
    );
    const vinyl2 = new Vinyl(
      crypto.randomUUID(),
      "Like a Rolling Stone",
      "Bob Dylan",
    );

    collection.addVinyl(vinyl1);

    collection.removeVinyl(vinyl2);

    expect(collection.getVinyls()).toHaveLength(1);
    expect(collection.getVinyls()[0]).toBe(vinyl1);
  });

  it("should remove multiple vinyls from the collection", () => {
    const collection = new VinylCollection();
    const vinyl1 = new Vinyl(crypto.randomUUID(), "Imagine", "John Lennon");
    const vinyl2 = new Vinyl(
      crypto.randomUUID(),
      "Smells Like Teen Spirit",
      "Nirvana",
    );
    const vinyl3 = new Vinyl(crypto.randomUUID(), "Bohemian Rhapsody", "Queen");

    collection.addVinyl(vinyl1);
    collection.addVinyl(vinyl2);
    collection.addVinyl(vinyl3);

    collection.removeVinyl(vinyl1);
    collection.removeVinyl(vinyl2);

    expect(collection.getVinyls()).toHaveLength(1);
    expect(collection.getVinyls()[0]).toBe(vinyl3);
  });

  it("should update vinyl information", () => {
    const collection = new VinylCollection();
    const vinyl = new Vinyl(
      crypto.randomUUID(),
      "Sweet Child O' Mine",
      "Guns N' Roses",
    );

    collection.addVinyl(vinyl);

    collection.updateVinyl(vinyl.getId(), {
      title: "Paradise City",
      artist: "Guns N' Roses",
    });

    const updatedVinyl = collection.getVinylById(vinyl.getId());

    expect(updatedVinyl).toBeDefined();
    expect(updatedVinyl?.getTitle()).toBe("Paradise City");
    expect(updatedVinyl?.getArtist()).toBe("Guns N' Roses");
  });
});
