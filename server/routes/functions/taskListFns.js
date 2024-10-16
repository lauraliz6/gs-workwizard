const populateTaskList = () => {
  const list = [];
  const programList = getProgramList();
  const assignments = getProjAssignments();
  //add "create program" object to task list,
  //with program list as list, and assignment info as details
  //add "copy projects",
  //with program list as list, blank details
  //add "make assignments" to task list,
  //with blank list and assignment info as details
  const customFormInfo = getCustomFormInfo();
  //add "custom forms" to task list,
  //with blank list and customFormInfo as details
  const dates = getDates();
  //add "adjust dates" to task list,
  //with blank list and dates as details
};

const getProgramList = () => {
  //reference ticket preview for list of programs
  //return list of programs with solution type and sku and wf link
  //example:
  const programs = [
    { name: "program name", sku: "jrny0002", wf: "12345678910" },
  ];
};

const getProjAssignments = () => {
  //reference ticket info for producer and AD
  //return object with producer and AD
};

// const getCustomFormInfo = () => {
//   //query ticket through API to get relevant information
//   //refer to Anne's document for relevant information
//   //return object with custom form info
// };

const getDates = () => {
  //reference ticket info for hard deadline
  //get today's date
  //return object with start date as today,
  //end date as hard deadline
  //example
  return { start_date: "", end_date: "" };
};
