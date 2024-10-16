function errorLogger(error, req, res, next) {
  // for logging errors
  console.error(error); // or using any fancy logging library
  next(error); // forward to next middleware
}

function errorResponder(error, req, res, next) {
  // responding to client
  if (error.code === "AUTOMATION_ERR") {
    res.status(500).send(error);
  } else if (!error.type) {
    res.status(300).send({ error: "unknown error" });
  } else {
    next(error); // forwarding exceptional case to fail-safe middleware
  }
}

function failSafeHandler(error, req, res, next) {
  // generic handler
  res.status(500).send(error);
}

module.exports = { errorLogger, errorResponder, failSafeHandler };
