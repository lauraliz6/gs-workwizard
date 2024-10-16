const axios = require("axios");
const host = process.env.HOST;

const apiTest = async (token) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/proj/search?ID=5ecedfd003e074628b19fd08e2ba4164`,
        config
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const userEmailTest = async (token, email) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/user/search?emailAddr=${email}&fields=name,emailAddr,ID`,
        config
      )
      .then((response) => {
        resolve({ done: true, email: response.data });
      })
      .catch((error) => {
        reject({ done: false, error: error });
      });
  });
};

const checkMyIssues = async (token, prodId) => {
  const queueId = "6450083f000e158f0e8d26ff4e5e74dc";
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/issue/search?projectID=${queueId}&enteredByID=${prodId}&fields=name,ID,status,lastNoteID,priority`,
        config
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getNoteContent = async (token, noteId) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/note/${noteId}?fields=noteText`,
        config
      )
      .then((response) => {
        resolve(response.data.data.noteText);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getIssueDetails = async (token, issueId) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/issue/${issueId}?fields=parameterValues,description,queueTopic,priority,status,entryDate`,
        config
      )
      .then((response) => {
        if (response.data) {
          const data = response.data.data;
          const td = {};
          td.description = data.description;
          td.topic = data.queueTopic.name;
          td.priority = data.priority;
          td.status = data.status;
          td.entry_date = data.entryDate;
          td.portfolio_name = data.parameterValues["DE:Portfolio/Account Name"];
          td.request_details = data.parameterValues["DE:Request Details"];
          td.assignments_needed = [
            data.parameterValues["DE:Art Director Assignment"] === "Yes"
              ? "art director"
              : null,
            data.parameterValues["DE:Writing Assignment"] === "Yes"
              ? "writer"
              : null,
            data.parameterValues["DE:Communication Strategist Assignment"] ===
            "Yes"
              ? "customer success manager"
              : null,
          ];
          td.type_of_work = data.parameterValues["DE:Type of Work"];
          td.journey_type = data.parameterValues["DE:Journey Type"];
          td.level_of_customization =
            data.parameterValues["DE:Level of Customization"];
          td.content_style = data.parameterValues["DE:Content Style"];
          td.customer_reviews = [
            data.parameterValues["DE:Script Review Needed?"] === "Yes"
              ? "script"
              : null,
            data.parameterValues["DE:Storyboard Review?"] === "Yes"
              ? "storyboard"
              : null,
          ];
          td.turn_current =
            data.parameterValues["DE:Turn Current?"] === "Yes" ? true : false;
          td.skus_ready_to_start =
            data.parameterValues["DE:SKUs ready to start"];
          td.requested_start_date =
            data.parameterValues["DE:Requested Start Date"];
          td.current_hard_deadline = data.parameterValues["DE:Current HD"];
          td.to_translation =
            data.parameterValues["DE:To Translation Services?"] === "Yes"
              ? true
              : false;
          resolve(td);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getIssueJourneys = async (token, issueId) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/issue/${issueId}?fields=parameterValues`,
        config
      )
      .then((response) => {
        if (response.data) {
          const data = response.data.data;
          const journeyType = data.parameterValues["DE:Journey Type"];
          resolve(journeyType);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const findPortfolio = async (token, name) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/portfolio/search?fields=name,ID&name=${name}`,
        config
      )
      .then((response) => {
        const data = response.data.data;
        if (data.length <= 0) {
          resolve({ exist: false });
        } else {
          resolve({ exist: true, data: data });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getJourneyTemplate = async (token, names, id) => {
  return new Promise(async (resolve, reject) => {
    const dataList = [];
    //array-ify if there's only one name in the program list
    if (!Array.isArray(names)) {
      names = [names];
    }
    const promises = names.map(async (name) => {
      const fullName = "Journey - Dummy Comp - " + name;
      const config = {
        headers: {
          sessionID: token,
        },
      };
      try {
        const response = await axios.get(
          `https://${host}/attask/api/v14.0/program/search?fields=projects:parameterValues,projects:tasks:taskNumber,projects:tasks:wbs&name=${fullName}`,
          config
        );
        const formatted = formatJourneyTemplateData(response.data);
        dataList.push(formatted[0]);
      } catch (error) {
        reject(error);
      }
    });
    await Promise.all(promises);
    resolve(dataList);
  });
};

const getJourneyProgramInfo = async (token, names) => {
  return new Promise(async (resolve, reject) => {
    const dataList = [];
    //array-ify if there's only one name in the program list
    if (!Array.isArray(names)) {
      names = [names];
    }
    const promises = names.map(async (name) => {
      const fullName = "Journey - Dummy Comp - " + name;
      const config = {
        headers: {
          sessionID: token,
        },
      };
      try {
        const response = await axios.get(
          `https://${host}//attask/api/v14.0/program/search?fields=parameterValues&name=${fullName}`,
          config
        );
        dataList.push(response.data.data[0]);
      } catch (error) {
        reject(error);
      }
    });
    await Promise.all(promises);
    resolve(dataList);
  });
};

const formatJourneyTemplateData = (data) => {
  const objectCodes = { PRGM: "program", PROJ: "project" };

  let structuredDetails = [];
  let so = {};
  const ap = data.data[0];

  so.id = ap.ID;
  so.type = "create";
  so.level = objectCodes[ap.objCode];
  so.title = ap.name;
  so.detailType = false;

  const pCh = [];
  const projects = ap.projects;
  projects.forEach((proj) => {
    const projObj = {};
    projObj.id = proj.ID;
    projObj.type = "create";
    projObj.level = objectCodes[proj.objCode];
    projObj.title = proj.name;
    projObj.detailType = "obj";

    const detailObj = {
      sku: proj.parameterValues["DE:SKU#"],
      element: proj.parameterValues["DE:Element"],
      production_tool: proj.parameterValues["DE:Production Tool"],
    };
    projObj.details = detailObj;

    const projCh = [];
    const tasks = proj.tasks;
    const projChObj = {
      id: tasks[0].ID, //using the first task id for this id
      type: "create",
      level: "tasks",
      title: "",
      detailType: "arr",
    };

    //need to sort the tasks by taskNumber
    const sorted = tasks
      .sort((a, b) => {
        return a.taskNumber - b.taskNumber; // sort by taskNumber in ascending order
      })
      .map(({ name, wbs }) => ({ name, wbs, children: [] }));
    //and then indent based on wbs
    sorted.forEach((data, index) => {
      const wbs = data.wbs;
      const level = wbs.split(".").length;
      if (level > 1) {
        const parentLevel = wbs
          .split(".")
          .slice(0, level - 1)
          .join(".");
        const parent = sorted.find((item) => item.wbs === parentLevel);
        parent.children.push(data);
        data.remove = true;
      }
    });

    const reduced = sorted.filter((item) => !item.remove);

    const arrayify = (items) => {
      const result = items.map((item) => {
        if (item.children.length > 0) {
          return [item.name, arrayify(item.children)];
        } else {
          return item.name;
        }
      });

      // Check if the result contains nested arrays and flatten if necessary
      const flattenedResult = result.reduce((acc, val) => {
        return acc.concat(val);
      }, []);

      return flattenedResult;
    };

    const arrays = arrayify(reduced);

    projChObj.details = arrays;

    projCh.push(projChObj);

    projObj.children = projCh;
    pCh.push(projObj);
  });

  so.children = pCh;

  structuredDetails.push(so);

  return structuredDetails;
};

const portfolioAssignments = async (token, id, returnAD = false) => {
  return new Promise((resolve, reject) => {
    const config = {
      headers: {
        sessionID: token,
      },
    };

    axios
      .get(
        `https://${host}/attask/api/v14.0/portfolio/${id}?fields=parameterValues`,
        config
      )
      .then((response) => {
        if (response.data.data) {
          const ad = response.data.data.parameterValues["DE:Art Director"];
          //if this is being called from autoFn.js, it will just ask for AD name
          if (returnAD) {
            resolve(ad);
          }
          const needed = [];
          if (ad) {
            needed.push("art director");
          }
          resolve(needed);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const updateStatus = async (token, issueId, stat) => {
  return new Promise((resolve, reject) => {
    let data = {
      status: stat,
    };

    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `https://guidespark.preview.workfront.com/attask/api/v9.0/issue/${issueId}`,
      headers: {
        sessionID: token,
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        resolve(JSON.stringify(response.data));
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports = {
  apiTest,
  userEmailTest,
  checkMyIssues,
  getNoteContent,
  getIssueDetails,
  findPortfolio,
  getJourneyTemplate,
  getJourneyProgramInfo,
  getIssueJourneys,
  portfolioAssignments,
  updateStatus,
};
