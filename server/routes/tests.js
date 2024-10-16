//EXAMPLE FOR SPLITTING UP NODE CODE
var express = require("express"),
  router = express.Router();

router
  // Add a binding to handle '/tests'
  .get("/", (req, res) => {
    res.json({ message: "Hello from the backend!" });
  });

module.exports = router;
