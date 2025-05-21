export class Bid {
  constructor(
    public id: string,
    public bidderId: string,
    public amount: number,
    public date: Date = new Date(),
  ) {}
}
