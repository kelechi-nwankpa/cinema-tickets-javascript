import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  #ticketPaymentService;
  #seatReservationService;

  constructor() {
    this.#ticketPaymentService = new TicketPaymentService();
    this.#seatReservationService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException("Invalid account IDsss");
    }

    if (!ticketTypeRequests || ticketTypeRequests.length === 0) {
      throw new InvalidPurchaseException("No tickets requested");
    }

    const ticketCounts = this.#calculateTicketCounts(ticketTypeRequests);

    this.#validatePurchaseRequest(ticketCounts);

    const totalAmount = this.#calculateTotalAmount(ticketCounts);
    const totalSeats = this.#calculateTotalSeats(ticketCounts);

    this.#ticketPaymentService.makePayment(accountId, totalAmount);
    this.#seatReservationService.reserveSeat(accountId, totalSeats);
  }

  #calculateTicketCounts(ticketTypeRequests) {
    return ticketTypeRequests.reduce((counts, request) => {
      const type = request.getTicketType();
      counts[type] = (counts[type] || 0) + request.getNoOfTickets();
      return counts;
    }, {});
  }

  #validatePurchaseRequest(ticketCounts) {
    const totalTickets = Object.values(ticketCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalTickets > 25) {
      throw new InvalidPurchaseException("Maximum 25 tickets per purchase");
    }

    const adultCount = ticketCounts.ADULT || 0;
    const childCount = ticketCounts.CHILD || 0;
    const infantCount = ticketCounts.INFANT || 0;

    if ((childCount > 0 || infantCount > 0) && adultCount === 0) {
      throw new InvalidPurchaseException(
        "Child/Infant tickets require Adult tickets"
      );
    }

    if (infantCount > adultCount) {
      throw new InvalidPurchaseException(
        "Cannot have more infants than adults"
      );
    }

    for (const count of Object.values(ticketCounts)) {
      if (count < 0) {
        throw new InvalidPurchaseException("Invalid ticket count");
      }
    }
  }

  #calculateTotalAmount(ticketCounts) {
    const prices = {
      ADULT: 25,
      CHILD: 15,
      INFANT: 0,
    };

    return Object.entries(ticketCounts).reduce((total, [type, count]) => {
      return total + prices[type] * count;
    }, 0);
  }

  #calculateTotalSeats(ticketCounts) {
    return (ticketCounts.ADULT || 0) + (ticketCounts.CHILD || 0);
  }
}
