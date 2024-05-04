// write route for event
const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router
    .route("/")
    .get(eventController.getAllEvents)
    .post(authController.protect, eventController.createEvent)
    .patch(authController.protect, eventController.updateEvent)
    .delete(authController.protect, eventController.deleteEvent)

module.exports = router;
