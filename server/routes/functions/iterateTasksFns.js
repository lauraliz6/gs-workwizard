//"create program"
const createPrograms = (programList) => {
  //create programs under company portfolio
  //add 'solution type' and 'sku' to form
  //add ad and producer to form
  //replace 'dummy comp' with company name
  //return list of programs created with wf links
  //example:
  return [
    { programName: "", wfLink: "", templateLink: "" },
    { programName: "", wfLink: "", templateLink: "" },
  ];
};

//"copy projects"
const copyProjects = (createdProgramList) => {
  //for each program in the list
  ////reference template program for list of projects to copy
  //////for each project, copy to new program under company
  //return list of created projects with wf links
  //example:
  return [{ projectName: "", wfLink: "" }];
};

//"make assignments"
const makeTaskAssignments = (createdProjectList, assignmentDetails) => {
  //for each project in the list
  ////get list of tasks
  //////for each task in the list
  //////assign producer where "producer" is listed
  //////assign ad where "ad" is listed
  //return success or failure
};

//"custom forms"
const fillCustomForms = (createdProjectList, customFormDetails) => {
  //for each project in the list
  ////fill out custom form with details
  ////Producer (producer who submitted ticket)
  ////Art Director
  ////Customer Hard Deadline
  ////SKU (for video - should be in template)
  ////Element (video, etc. - should be in template)
  ////Production Tool (AE, etc. - should be in template)
  ////Asset Cycle (Update/etc - should be in template)
  ////To translation services - always no
  //return success or failure
};

//"adjust dates"
const adjustDates = (createdProjectList, dates) => {
  //for each project in the list
  ////adjust start date and end date
  //return success or failure
};
