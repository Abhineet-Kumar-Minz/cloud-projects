const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");

router.get("/:room", auth, async (req, res) => {
  const messages = await Message.find({ room: req.params.room });
  res.json(messages);
});

module.exports = router;