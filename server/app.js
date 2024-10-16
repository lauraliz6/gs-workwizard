const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
require("dotenv").config();

app.use(cors());

app.use(express.static("public"));

//EXAMPLE OF ROUTES IN OTHER FILES
var testRoutes = require("./routes/tests.js");
// Import my test routes into the path '/test'
app.use("/tests", testRoutes);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.get("/backend", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

var authRoutes = require("./routes/auth.js");
app.use("/auth", authRoutes);

var apiRoutes = require("./routes/api.js");
app.use("/wf", apiRoutes);

var autoRoutes = require("./routes/auto.js");
app.use("/auto", autoRoutes);

//error checking - started from https://scoutapm.com/blog/express-error-handling
const { errorLogger, errorResponder, failSafeHandler } = require("./errors.js");

const fsPromises = require("fs").promises;

//example of setting error type
app.get("/errorTypeTwo", (req, res, next) => {
  fsPromises
    .readFile("./two.txt")
    .then((data) => res.send(data))
    .catch((err) => {
      err.type = "errorType"; // custom prop to specify handling behaviour
      next(err);
    });
});

app.get("/error", (req, res) => {
  //TODO:
  //redirect to frontend page here
  res.send("Custom error landing page.");
});

app.use(errorLogger);
app.use(errorResponder);
app.use(failSafeHandler);
