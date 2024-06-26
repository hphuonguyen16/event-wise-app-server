// write route for event
const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const ticketTypeController = require("../controllers/ticketTypeController");
const registrationController = require("../controllers/registrationController");
const tierController = require("../controllers/tierController");
const canvasController = require("../controllers/canvasController");
const promoController = require("../controllers/promoController");
const router = express.Router();


router.get("/my-events", authController.protect, eventController.getMyEvents);
router.put("/publish", authController.protect, eventController.publishEvent);
router.get("/search", eventController.searchEventsOrOrganizers);

router.put(
  "/change-status",
  authController.protect,
  eventController.changeStatusEvent
);

router
  .route("/")
  .get(eventController.getAllEvents)
  .post(authController.protect, eventController.createEvent);


router
  .route("/:id")
  .get(eventController.getEvent)
  .put(authController.protect, eventController.updateEvent)
  .delete(authController.protect, eventController.deleteEvent);

router
  .route("/:id/ticket-types")
  .get(authController.protect, ticketTypeController.getTicketTypesByEventId);

router
  .route("/:id/attendees")
  .get(authController.protect, eventController.getAttendeesByEvent);

  router
    .route("/:id/ticket-status")
    .put(authController.protect, eventController.changeTicketStatusEvent);

router
  .route("/:id/registrations")
  .get(authController.protect, registrationController.getRegistrationsByEventId);

router
  .route("/:id/tiers")
  .get(authController.protect, tierController.getTiersByEventId);

router
  .route("/:id/canvas")
  .get(authController.protect, canvasController.getCanvasByEventId)
  .put(authController.protect, canvasController.updateCanvasByEventId);

router
  .route("/:id/overview")
  .get(authController.protect, eventController.getEventOverview);

router
  .route("/:id/promos")
  .get(authController.protect, promoController.getPromosByEvent);
module.exports = router;
