// write route for event
const express = require("express");
const ticketTypeController = require("../controllers/ticketTypeController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);


router
  .route("/")
  .get(ticketTypeController.getAllTicketTypes)
  .post(authController.protect, ticketTypeController.createTicketType);

router
  .route("/:id")
  .get(ticketTypeController.getTicketType)
  .put(authController.protect, ticketTypeController.updateTicketType)
  .delete(authController.protect, ticketTypeController.deleteTicketType);


module.exports = router;
