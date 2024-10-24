import { expect } from "chai";
import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";

describe("TicketService", () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  describe("purchaseTickets", () => {
    it("should successfully process valid adult only tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest("ADULT", 2));
      }).to.not.throw();
    });

    it("should successfully process valid adult and child tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 2),
          new TicketTypeRequest("CHILD", 1)
        );
      }).to.not.throw();
    });

    it("should successfully process valid adult and infant tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 2),
          new TicketTypeRequest("INFANT", 1)
        );
      }).to.not.throw();
    });

    it("should reject invalid account IDs", () => {
      expect(() => {
        ticketService.purchaseTickets(0, new TicketTypeRequest("ADULT", 1));
      }).to.throw(InvalidPurchaseException, "Invalid account ID");
    });

    it("should reject purchases with no tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(1);
      }).to.throw(InvalidPurchaseException, "No tickets requested");
    });

    it("should reject purchases exceeding 25 tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest("ADULT", 26));
      }).to.throw(InvalidPurchaseException, "Maximum 25 tickets per purchase");
    });

    it("should reject child tickets without adult tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest("CHILD", 1));
      }).to.throw(
        InvalidPurchaseException,
        "Child/Infant tickets require Adult tickets"
      );
    });

    it("should reject infant tickets without adult tickets", () => {
      expect(() => {
        ticketService.purchaseTickets(1, new TicketTypeRequest("INFANT", 1));
      }).to.throw(
        InvalidPurchaseException,
        "Child/Infant tickets require Adult tickets"
      );
    });

    it("should reject more infants than adults", () => {
      expect(() => {
        ticketService.purchaseTickets(
          1,
          new TicketTypeRequest("ADULT", 1),
          new TicketTypeRequest("INFANT", 2)
        );
      }).to.throw(
        InvalidPurchaseException,
        "Cannot have more infants than adults"
      );
    });
  });
});
