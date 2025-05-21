export interface DomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): String;
}
