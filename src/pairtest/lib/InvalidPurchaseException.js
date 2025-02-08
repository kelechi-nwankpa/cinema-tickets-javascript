export default class InvalidPurchaseException extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidPurchaseException";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidPurchaseException);
    }
  }
}
