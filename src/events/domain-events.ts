import { DomainEvent } from "../interfaces/domain-event.interface";
import { AggregateRoot } from "./aggragate-root";

export class DomainEvents {
  private static handlers: Map<string, Array<(event: DomainEvent) => void>> =
    new Map();
  private static markedAggregates: AggregateRoot<any>[] = [];

  public static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.getId());
    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  public static dispatchEventsForAggregate(id: String): void {
    const aggregate = this.findMarkedAggregateByID(id);
    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    aggregate.getDomainEvents().forEach((event: DomainEvent) => {
      this.dispatch(event);
    });
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: AggregateRoot<any>,
  ): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(
    id: String,
  ): AggregateRoot<any> | undefined {
    return this.markedAggregates.find((aggregate) => id === aggregate.getId());
  }

  public static register(
    callback: (event: DomainEvent) => void,
    eventName: string,
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(callback);
  }

  public static dispatch(event: DomainEvent): void {
    const eventClassName = event.constructor.name;
    if (this.handlers.has(eventClassName)) {
      const handlers = this.handlers.get(eventClassName)!;
      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
