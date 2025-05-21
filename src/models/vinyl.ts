export class Vinyl {
  constructor(
    private id: string,
    private title: string,
    private artist: string,
    private collectionId?: string,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getArtist(): string {
    return this.artist;
  }

  public setId(id: string): void {
    this.id = id;
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public setArtist(artist: string): void {
    this.artist = artist;
  }

  public getCollectionId(): string | undefined {
    return this.collectionId;
  }

  public setCollectionId(collectionId: string): void {
    this.collectionId = collectionId;
  }
}
