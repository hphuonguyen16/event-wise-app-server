const express = require("express");
const tierController = require("../controllers/tierController");
const authController = require("../controllers/authController");
const ticketTypeController = require("../controllers/ticketTypeController");
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(tierController.getAllTiers)
  .post(tierController.createTier);

router
  .route("/:id")
  .get(tierController.getTier)
  .put(tierController.updateTier)
  .delete(tierController.deleteTier);

router
  .route("/:id/ticketTypes")
  .get(ticketTypeController.getTicketTypeByTierId);

module.exports = router;
