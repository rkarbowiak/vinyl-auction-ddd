import { DomainEvent } from "../interfaces/domain-event.interface";
import { DomainEvents } from "./domain-events";

export abstract class AggregateRoot<T> {
  protected id: string;
  private domainEvents: DomainEvent[] = [];

  constructor(id: string = crypto.randomUUID()) {
    this.id = id;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  equals(aggregate: AggregateRoot<T>): boolean {
    return this.id === aggregate.id;
  }

  public clearEvents(): void {
    this.domainEvents = [];
  }

  public getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  public getId(): String {
    return this.id;
  }
}
