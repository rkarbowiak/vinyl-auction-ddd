export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  private error: string;
  private _value: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || "";
    this._value = value as T;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error("Cannot get value from failure result");
    }
    return this._value;
  }

  public getError(): string {
    if (!this.isFailure) {
      throw new Error("Cannot get error from success result");
    }
    return this.error;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }
}
