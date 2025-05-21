export class Bid {
  constructor(
    public id: string,
    public bidderId: string,
    public amount: number,
    public date: Date = new Date(),
  ) {}

  static create(bidderId: string, amount: number): Bid {
    if (amount <= 0) {
      throw new Error("Bid amount must be greater than zero.");
    }

    return new Bid(crypto.randomUUID(), bidderId, amount, new Date());
  }
}
