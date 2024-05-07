// write route for event
const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const ticketTypeController = require("../controllers/ticketTypeController");
const router = express.Router();

router.use(authController.protect);

router.get("/my-events", authController.protect, eventController.getMyEvents);

router
    .route("/")
    .get(eventController.getAllEvents)
  .post(authController.protect, eventController.createEvent)
    
router
  .route("/:id")
  .get(eventController.getEvent)
  .patch(authController.protect, eventController.updateEvent)
  .delete(authController.protect, eventController.deleteEvent);

router
  .route("/:id/ticket-types")
  .get(authController.protect, ticketTypeController.getTicketTypesByEventId)

module.exports = router;
