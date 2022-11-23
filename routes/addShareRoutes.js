const express = require("express");
const addShareController = require("../controllers/addShareController");
const router = express.Router();

router.get("/", addShareController.getAllShare);
router.post("/", addShareController.addShare);
router.get("/:id", addShareController.shareDetails);
router.put("/:id", addShareController.updateShare);
router.delete("/:id", addShareController.deleteShare);

module.exports = router;
