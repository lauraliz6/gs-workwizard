//this was in populateTaskList
//add "make assignments" to task list,
//with blank list and assignment info as details
const assignTask = {
  task: "make assignments",
  list: [],
  details: assignments,
};
list.push(assignTask);

//this was in automationIteration
console.log("now making assignments");
//finally make assignments - "make assignments"
const assignInfo = list.find((item) => item.task === "make assignments");
const assignDetails = assignInfo.details;
const assigned = await makeTaskAssignments(token, newProjects, assignDetails);
console.log("made assignments");
console.log(assigned);

//"make assignments"
const makeTaskAssignments = async (
  token,
  createdProjectList,
  assignmentDetails
) => {
  return new Promise(async (resolve, reject) => {
    try {
      //first get user ids for the ad and producer
      const adUserId = await getUserId(token, assignmentDetails.ad);
      const producerUserId = await getUserId(token, assignmentDetails.producer);
      //flatten project list
      const allProjects = createdProjectList.map((program) => {
        return program.projects;
      });
      const projectList = allProjects.flat(1);
      //for each project in the list
      const projectTasks = await Promise.all(
        ////get list of tasks (task id)
        projectList.map(async (project) => {
          const tasks = await getProjectTasks(token, project);
          //////filter tasks to ones with producer assigned or ad assigned
          const tasksWithProducer = tasks.filter(
            (task) =>
              task.assignmentsListString.indexOf("Job Role: Producer") > -1
          );
          const tasksWithAd = tasks.filter(
            (task) =>
              task.assignmentsListString.indexOf("Job Role: Art Director") > -1
          );
          //////for each task in the list
          //////assign producer where "producer" is listed
          const assignProducers = await Promise.all(
            tasksWithProducer.map(async (task) => {
              const assignProducer = await assignUser(
                token,
                task.ID,
                producerUserId
              );
              return assignProducer;
            })
          );
          //////assign ad where "ad" is listed
          const assignAds = await Promise.all(
            tasksWithAd.map(async (task) => {
              const assignAd = await assignUser(token, task.ID, adUserId);
              return assignAd;
            })
          );
          const allErrors = [];
          assignProducers.forEach((assignment) => {
            if (assignment.error) {
              allErrors.push(assignment.error);
            }
          });
          assignAds.forEach((assignment) => {
            if (assignment.error) {
              allErrors.push(assignment.error);
            }
          });
          //return any errors
          return allErrors;
        })
      );
      //return success or failure
      resolve(projectTasks.flat(1));
    } catch (error) {
      console.log(error);
    }
  });
};

const getUserId = async (token, name) => {
  const encodedName = encodeURI(name);
  return new Promise((resolve, reject) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://${host}/attask/api/v14.0/user/search?name=${name}`,
      headers: {
        sessionID: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data.data[0]) {
          const ID = response.data.data[0].ID;
          resolve(ID);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const getProjectTasks = async (token, project) => {
  return new Promise((resolve, reject) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://${host}/attask/api/v15.0/proj/${project}?fields=tasks:assignmentsListString`,
      headers: {
        sessionID: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data.data) {
          resolve(response.data.data.tasks);
        } else {
          reject({ error: "no data" });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const assignUser = async (token, taskID, userID) => {
  return new Promise((resolve, reject) => {
    //USING THE HACKY SOLUTION HERE TOO - SHOULD CHANGE
    setTimeout(5000);
    let config = {
      method: "put",
      maxBodyLength: Infinity,
      url: `https://${host}/attask/api/v14.0/task/${taskID}/assign?objCode=USER&objID=${userID}`,
      headers: {
        sessionID: token,
      },
    };

    axios
      .request(config)
      .then((response) => {
        if (response.data.data) {
          resolve({ done: "ok" });
        } else {
          resolve({ done: "no", error: taskID });
        }
      })
      .catch(async (error) => {
        console.log(error.response.data);
        resolve({ done: "no", error: taskID });
      });
  });
};
