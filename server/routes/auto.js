var express = require("express"),
  router = express.Router();
const bodyParser = require("body-parser");

const {
  populateTaskList,
  automationIteration,
  checkAutomationWork,
  postProgramUpdate,
  deleteProgramsAndAssocProjects,
} = require("./functions/autoFn.js");
const { checkAuthForApi } = require("./functions/authFn.js");

router.use(bodyParser.json());

router.post("/", async (req, res, next) => {
  try {
    //get token
    const accessToken = await checkAuthForApi();
    //variables from frontend
    const journeys = req.body.journeys;
    const company = req.body.company;
    const companyId = req.body.companyId;
    const producerName = req.body.producerName;
    const id = req.body.issueId;
    const priority = req.body.priority;

    //make to-do list for automation
    const todoList = await populateTaskList(
      accessToken,
      journeys,
      company,
      companyId,
      producerName,
      id,
      priority
    );

    //send to-do list to iteration function to actually automate
    const automated = await automationIteration(
      accessToken,
      todoList,
      companyId
    );
    res.send(automated);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/check", async (req, res, next) => {
  try {
    //get token
    const accessToken = await checkAuthForApi();
    //info from frontend
    const programs = req.body.programs;
    const checkMyWork = await checkAutomationWork(accessToken, programs);
    res.send({ correctWork: checkMyWork });
  } catch (error) {
    next(error);
  }
});

router.post("/issueNoteUpdate", async (req, res, next) => {
  try {
    //get token
    const accessToken = await checkAuthForApi();
    //info from frontend
    const programs = req.body.programs;
    const ticketId = req.body.id;
    const updateIssue = await postProgramUpdate(
      accessToken,
      programs,
      ticketId
    );
    if (updateIssue.success) {
      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    //get token
    const accessToken = await checkAuthForApi();
    //info from frontend
    const programs = req.body.programs;
    const deleteProgramsProjects = await deleteProgramsAndAssocProjects(
      accessToken,
      programs
    );
    res.send(deleteProgramsProjects);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
