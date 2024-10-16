//this is where the functions for automation will live
const axios = require("axios");
const host = process.env.HOST;
const util = require("util");
const { getJourneyProgramInfo, portfolioAssignments } = require("./apiFn.js");

const automationError = new Error();
automationError.code = "AUTOMATION_ERR";

//todo list
const populateTaskList = async (
  token,
  journeys,
  company,
  companyId,
  producerName,
  issueID,
  priority
) => {
  try {
    //set up list
    const list = [];
    //get list of programs (template journeys)
    const programList = await getProgramList(token, journeys, company);
    //get assignments
    const assignments = await getProjAssignments(
      token,
      companyId,
      producerName
    );
    //fetch dates info - start date and hard deadline from ticket
    const dates = await getDates(token, issueID);
    //add "create program" object to task list,
    //with program list as list, and assignment info as details
    const programTask = {
      task: "create program",
      list: programList,
      details: assignments,
    };
    list.push(programTask);
    //add "copy projects",
    //with needed info as details, blank list
    const copyTask = {
      task: "copy projects",
      list: [],
      details: {
        company: company,
        dates: dates,
        assignments: assignments,
        priority: priority,
      },
    };
    list.push(copyTask);
    return list;
  } catch (error) {
    automationError.step = "list_creation";
    automationError.message = "Error in creating automation list.";
    throw automationError;
  }
};

const getProgramList = async (token, journeys, company) => {
  try {
    const programInfo = await getJourneyProgramInfo(token, journeys);
    const programs = [];
    programInfo.forEach((program) => {
      const programObj = {};
      programObj.name = program.name.replace("Dummy Comp", company);
      programObj.sku = program.parameterValues["DE:SKU#"];
      programObj.solutionType = program.parameterValues["DE:Solution Type"];
      programObj.wf = program.ID;
      programs.push(programObj);
    });
    return programs;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getProjAssignments = async (token, companyId, producerName) => {
  try {
    const assignedAD = await portfolioAssignments(token, companyId, true);
    const assignedProducer = producerName;
    const assignments = { ad: assignedAD, producer: assignedProducer };
    return assignments;
  } catch (error) {
    throw error;
  }
};

const getDates = async (token, id) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/issue/${id}?fields=parameterValues`,
        config
      )
      .then((response) => {
        if (response.data) {
          const data = response.data.data;
          const startDate = data.parameterValues["DE:Requested Start Date"]
            ? data.parameterValues["DE:Requested Start Date"]
            : "today";
          const endDate = data.parameterValues["DE:Current HD"]
            ? data.parameterValues["DE:Current HD"]
            : "none";
          resolve({ start_date: startDate, end_date: endDate });
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//automation
const automationIteration = async (token, list, portfolioId) => {
  try {
    console.log("automating!");
    //first create programs
    const programInfo = list.find((item) => item.task === "create program");
    const programList = programInfo.list;
    const assignmentDetails = programInfo.details;
    const newPrograms = await createProgramsBulk(
      token,
      portfolioId,
      programList,
      assignmentDetails
    );
    //next copy projects - "copy projects"
    const copyInfo = list.find((item) => item.task === "copy projects");
    const copyDetails = copyInfo.details;
    const newProjects = await copyProjectsBulk(token, newPrograms, copyDetails);
    if (newProjects.projects) {
      console.log("done");
      return { done: true, programs: newPrograms };
    } else {
      //delete programs/projects
      const deletePrevWork = await deleteProgramsAndAssocProjects(
        token,
        newPrograms
      );
      if (deletePrevWork.done) {
        automationError.message = "Error in project creation";
        throw automationError;
      } else {
        automationError.message = "Multiple errors";
        throw automationError;
      }
    }
  } catch (error) {
    console.log(error);
    if (error.programs) {
      //delete programs/projects
      const deletePrevWork = await deleteProgramsAndAssocProjects(
        token,
        error.programs
      );
      if (deletePrevWork.done) {
        automationError.message = "Error in project creation";
        throw automationError;
      } else {
        automationError.message = "Multiple errors";
        throw automationError;
      }
    }
    automationError.message = "Error in automation process";
    throw automationError;
  }
};

//"create program - BULK"
const createProgramsBulk = async (
  token,
  portfolioId,
  programList,
  assignmentDetails
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const mappedData = programList.map((program) => {
        let programObj = {
          name: program.name,
          portfolioID: portfolioId,
          categoryID: "588bd23f00025832b540c92bdcbcb296",
          parameterValues: {
            "DE:SKU#": program.sku,
            "DE:Solution Type": program.solutionType,
            "DE:Producer/Program Owner": assignmentDetails.producer,
            "DE:Art Director": assignmentDetails.ad,
          },
        };
        return programObj;
      });
      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `https://${host}/attask/api/v14.0/program`,
        headers: {
          "Content-Type": "application/json",
          sessionID: token,
        },
        data: JSON.stringify(mappedData),
      };
      const response = await axios.request(config);
      const created = response.data.data;
      //map onto needed structure for project creation
      const createdObjs = created.map((createdProgram) => {
        const correspondingProgram = programList.find(
          (program) => program.name === createdProgram.name
        );
        const createdProgramObj = {
          programName: createdProgram.name,
          wfId: createdProgram.ID,
          templateId: correspondingProgram.wf,
        };
        return createdProgramObj;
      });
      resolve(createdObjs);
    } catch (error) {
      reject(error);
    }
  });
};

const copyProjectsBulk = async (token, createdProgramList, details) => {
  return new Promise(async (resolve, reject) => {
    //fetch list of projects for each program
    const programProjects = await Promise.all(
      createdProgramList.map(async (program) => {
        ////with associated information
        ////and add program id to each project
        const projects = await getTemplateProgramProjectsWithInfo(
          token,
          program.templateId,
          details,
          program.wfId
        );
        return projects;
      })
    ).catch((error) => {
      reject({ error: error, programs: createdProgramList });
    });
    //flatten array
    const allProjectsToCreate = programProjects.flat(1);
    //then do bulk api create project request
    const allCreatedProjects = await createProjectsBulk(
      token,
      allProjectsToCreate
    );
    if (allCreatedProjects.length > 0) {
      resolve({ projects: true });
    } else {
      reject({ projects: false, programs: createdProgramList });
    }
  });
};

const getTemplateProgramProjectsWithInfo = async (
  token,
  programTemplateId,
  details,
  programWfId
) => {
  //this is for ONE program
  return new Promise(async (resolve, reject) => {
    const myProjects = await getTemplateProgramProjects(
      token,
      programTemplateId
    );
    const myProjectsWithInfo = await Promise.all(
      myProjects.map(async (project) => {
        const projectWithInfo = await getTemplateProjectInfo(
          token,
          project.ID,
          details,
          programWfId
        );
        return projectWithInfo;
      })
    ).catch((error) => {
      reject(error);
    });
    resolve(myProjectsWithInfo);
  });
};

const getTemplateProgramProjects = async (token, programID) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/program/${programID}?fields=projects`,
        config
      )
      .then((response) => {
        if (response.data.data) {
          const projectList = response.data.data.projects;
          resolve(projectList);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getTemplateProjectInfo = async (
  token,
  templateProjectID,
  details,
  targetProgram
) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v15.0/proj/${templateProjectID}?fields=parameterValues,templateID`,
        config
      )
      .then((response) => {
        if (response.data.data) {
          const projectInfo = response.data.data;
          const sku = projectInfo.parameterValues["DE:SKU#"] || "";
          //using spread operator and & to only include parameter
          //if it already exists in info
          //to minimize errors from WF API
          //per this article: https://amberley.dev/blog/2020-09-07-conditionally-add-to-array-or-obj/
          const infoForApi = {
            ...(projectInfo.name && {
              name: projectInfo.name.replace("Dummy Comp", details.company),
            }),
            objCode: "PROJ",
            ...(targetProgram && { programID: targetProgram }),
            status: "REQ",
            ...(details.priority && { priority: details.priority }),
            ...(details.dates.start_date && {
              plannedStartDate: details.dates.start_date,
            }),
            ...(projectInfo.templateID && {
              templateID: projectInfo.templateID,
            }),
            parameterValues: {
              ...(projectInfo.parameterValues["DE:SKU#"] && {
                "DE:SKU#": projectInfo.parameterValues["DE:SKU#"],
              }),
              ...(details.assignments.ad && {
                "DE:Art Director": details.assignments.ad,
              }),
              "DE:Customer Hard Deadline": details.dates.end_date,
              //the last four should NOT be filled out if it's an engagement project
              ...(projectInfo.parameterValues["DE:Element"] &&
                sku !== "ENGAGE" && {
                  "DE:Element": projectInfo.parameterValues["DE:Element"],
                }),
              ...(projectInfo.parameterValues["DE:Production Tool"] &&
                sku !== "ENGAGE" && {
                  "DE:Production Tool":
                    projectInfo.parameterValues["DE:Production Tool"],
                }),
              ...(sku !== "ENGAGE" && { "DE:Asset Cycle": "New" }),
              ...(sku !== "ENGAGE" && { "DE:Asset Status": "Inactive" }),
            },
          };
          resolve(infoForApi);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const createProjectsBulk = async (token, projectArr) => {
  return new Promise((resolve, reject) => {
    let data = JSON.stringify(projectArr);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://guidespark.preview.workfront.com/attask/api/v14.0/project",
      headers: {
        "Content-Type": "application/json",
        sessionID: token,
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        resolve(response.data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const checkAutomationWork = async (token, programs) => {
  return new Promise(async (resolve, reject) => {
    const checkProgramPromises = await Promise.all(
      programs.map(async (program) => {
        //get template and actual info
        const templateProgram = await fetchProgramStructure(
          token,
          program.templateId
        );
        const actualProgram = await fetchProgramStructure(token, program.wfId);
        //then compare
        //deep equal: https://www.geeksforgeeks.org/node-js-util-isdeepstrictequal-method/
        const objMatch = util.isDeepStrictEqual(templateProgram, actualProgram);
        //then return true/false
        return objMatch;
      })
    ).catch((error) => {
      reject(error);
    });
    const onlyTrue = checkProgramPromises.every((x) => x);
    resolve(onlyTrue);
  });
};

const fetchProgramStructure = async (token, id) => {
  return new Promise((resolve, reject) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://${host}/attask/api/v14.0/program/${id}?fields=projects:tasks:taskNumber,projects:tasks:wbs`,
      headers: {
        sessionID: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        //just last part of name at program level
        const curName = response.data.data.name;
        const newName = curName.split("-").pop();
        response.data.data.name = newName;
        //ID should be blank at program level
        response.data.data.ID = "";
        //just last part of name at project level
        const projects = response.data.data.projects;
        projects.map((project) => {
          const curProjName = project.name;
          const newProjName = curProjName.split("-").pop();
          project.name = newProjName;
          //ID should be blank at project level
          project.ID = "";
          const tasks = project.tasks;
          tasks.map((task) => {
            //ID should be blank at task level
            task.ID = "";
          });
          //sort tasks by task number
          const sorted = tasks.sort((a, b) => {
            return a.taskNumber - b.taskNumber; // sort by taskNumber in ascending order
          });
          project.tasks = sorted;
        });
        resolve(response.data.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const postProgramUpdate = async (token, programs, ticketId) => {
  return new Promise((resolve, reject) => {
    const programStrings = programs.map((program) => {
      const name = program.programName;
      const wfId = program.wfId;
      const string = `${name}: https://guidespark.preview.workfront.com/program/${wfId}/projects`;
      return string;
    });
    const update = `Programs created!\\n ${programStrings.join(" \\n")}`;
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://${host}/attask/api/v16.0/note?updates={"noteText":"${update}", "noteObjCode":"OPTASK", "objID":"${ticketId}"}`,
      headers: {
        "Content-Type": "text/html",
        sessionID: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data) {
          resolve({ success: true });
        } else {
          reject({ error: "failed to post links" });
        }
      })
      .catch((error) => {
        reject({ error: error });
      });
  });
};

const deleteProgramsAndAssocProjects = async (token, programs) => {
  return new Promise(async (resolve, reject) => {
    //return if there's no programs
    if (programs.length <= 0) {
      resolve({ done: true });
    }
    //first get all associated projects with the programs
    const programProjects = await Promise.all(
      programs.map(async (program) => {
        const projects = await getTemplateProgramProjects(token, program.wfId);
        const justIds = projects.map((project) => {
          return project.ID;
        });
        return justIds;
      })
    ).catch((error) => {
      reject(error);
    });
    //then flatten projects to one array with just ids of projects
    const allProjects = programProjects.flat(1);
    //then send bulk DELETE request to delete projects
    if (allProjects.length > 0) {
      const deleteProjects = await deleteObjs(token, "project", allProjects);
      if (!deleteProjects.success) {
        reject({ error: "failed to delete projects" });
      }
    }
    //then send bulk DELETE request to delete programs
    const justProgramIds = programs.map((program) => {
      return program.wfId;
    });
    const deletePrograms = await deleteObjs(token, "program", justProgramIds);
    if (!deletePrograms.success) {
      reject({ error: "failed to delete programs" });
    }
    resolve({ done: true });
  });
};

const deleteObjs = async (token, objType, list) => {
  const listStr = list.join(",");
  return new Promise((resolve, reject) => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `https://${host}/attask/api/v16.0/${objType}?ID=${listStr}`,
      headers: {
        sessionID: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data.data.success) {
          resolve({ success: true });
        } else {
          reject({ error: "failed to delete" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  populateTaskList,
  automationIteration,
  checkAutomationWork,
  postProgramUpdate,
  deleteProgramsAndAssocProjects,
};
