var express = require("express"),
  router = express.Router();

require("dotenv").config();
var sessionstorage = require("sessionstorage");

const { checkAuthForApi } = require("./functions/authFn.js");

const {
  checkMyIssues,
  getNoteContent,
  getIssueDetails,
  findPortfolio,
  getJourneyTemplate,
  getIssueJourneys,
  portfolioAssignments,
  updateStatus,
} = require("./functions/apiFn.js");

//api call to pm ticketing queue
router.get("/myissues", async (req, res, next) => {
  try {
    const prodId = sessionstorage.getItem("userId");
    const accessToken = await checkAuthForApi();
    const apiInfo = await checkMyIssues(accessToken, prodId);
    const issuesArr = [];

    for (const item of apiInfo.data) {
      const obj = {};
      obj.id = item.ID;
      obj.ticketName = item.name;
      obj.status = item.status;
      obj.customer = item.name.split("-").pop().split("-").pop().trim();
      obj.priority = item.priority;
      obj.note =
        item.lastNoteID !== null
          ? await getNoteContent(accessToken, item.lastNoteID)
          : "";
      issuesArr.push(obj);
    }
    res.send(issuesArr);
  } catch (error) {
    next(error);
  }
});

//fetching issue details
router.get("/issueDetails", async (req, res, next) => {
  // below is for resetting
  // res.send({ data: "data" });
  try {
    const issue_id = req.query.id;
    const accessToken = await checkAuthForApi();
    const issueInfo = await getIssueDetails(accessToken, issue_id);
    res.send(issueInfo);
  } catch (error) {
    next(error);
  }
});

//api call to check if portfolio exists
router.get("/findPortfolio", async (req, res, next) => {
  // below is for resetting
  // res.send({ data: "data" });
  try {
    const name = req.query.name;
    const accessToken = await checkAuthForApi();
    const portfolioExist = await findPortfolio(accessToken, name);
    res.send(portfolioExist);
  } catch (error) {
    next(error);
  }
});

//api call to get needed journey/program info
router.get("/templateProgram", async (req, res, next) => {
  // below is for resetting
  // res.send({ data: "data" });
  try {
    const id = req.query.id;
    // const program_name = "JRNY0002%20-%20HDHP%20Success";
    const accessToken = await checkAuthForApi();
    const program = await getIssueJourneys(accessToken, id);
    const programInfo = await getJourneyTemplate(accessToken, program);
    res.send(programInfo);
  } catch (error) {
    next(error);
  }
});

//get assignments from portfolio (ad)
router.get("/portAssignments", async (req, res, next) => {
  // below is for resetting
  // res.send({ data: "data" });
  try {
    const portId = req.query.id;
    const accessToken = await checkAuthForApi();
    const portAssignments = await portfolioAssignments(accessToken, portId);
    res.send(portAssignments);
  } catch (error) {
    next(error);
  }
});

//update status
router.get("/updateStatus", async (req, res, next) => {
  try {
    const id = req.query.id;
    const status = req.query.status;
    const accessToken = await checkAuthForApi();
    const update = await updateStatus(accessToken, id, status);
    res.send(update);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
