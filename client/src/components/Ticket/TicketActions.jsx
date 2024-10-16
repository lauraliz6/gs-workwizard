import { Button, Container, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";

import { updateStatus } from "../../fn/workfront";
import { checkCanChangeStatus } from "../../fn/wfCodes";

export default function TicketActions(props) {
  const status = props.status;
  const id = props.id;
  const producerName = props.producer.name;

  const [journeys, setJourneys] = useState([]);
  const [company, setCompany] = useState();

  const [canKickOff, setCanKickOff] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (status === "ARA") {
      setCanKickOff(true);
    } else {
      setCanKickOff(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "AAC") {
      setCanClose(true);
    } else {
      setCanClose(false);
    }
  });

  useEffect(() => {
    const journeyList = props.info.journey_type;
    setJourneys(journeyList);
    const companyName = props.info.portfolio_name;
    setCompany(companyName);
  }, [props.info]);

  const kickOffProcess = () => {
    try {
      if (checkCanChangeStatus("AIP", status)) {
        updateStatus(id, "AIP").then((response) => {
          if (response.status === "AIP") {
            //pass status change up to Ticket component
            props.changeStatus(response.status);
            props.changeStatusMessage(
              "Please wait, automation is in progress..."
            );
            //start automation process
            automation()
              .then((response) => {
                if (response.done) {
                  //change message to indicate check is being done
                  props.changeStatusMessage("Checking my work...");
                  const programs = response.programs;
                  //check programs against preview
                  checkAutomationWork(programs)
                    .then((response) => {
                      if (response.correctWork) {
                        postToWfIssue(programs)
                          .then((response) => {
                            if (response.success) {
                              markComplete();
                            } else {
                              markComplete();
                              handleError({
                                errType: "minor",
                                error: "Couldn't post to Workfront",
                              });
                            }
                          })
                          .catch((error) => {
                            markComplete();
                            handleError({
                              errType: "minor",
                              error: "Couldn't post to Workfront",
                            });
                          });
                      } else {
                        //if the work isn't correct
                        handleError({
                          errType: "check",
                          error: "automation check error",
                          programs: programs,
                        });
                      }
                    })
                    .catch((error) => {
                      handleError({
                        errType: "check",
                        error: "automation check error",
                        programs: programs,
                      });
                    });
                } else {
                  handleError({
                    errType: "automation",
                    error: "automation error",
                  });
                }
              })
              .catch((error) => {
                handleError({
                  errType: "automation",
                  error: "automation error",
                });
              });
          } else {
            handleError({
              errType: "statusChange",
              error:
                "Failed to change status, please try again or contact Ops.",
            });
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markComplete = () => {
    updateStatus(id, "AAC")
      .then((response) => {
        if (response.status === "AAC") {
          props.changeStatusMessage("Automation complete!");
          props.changeStatusIcon("done");
          setTimeout(() => {
            props.changeStatus("AAC");
          }, 2500);
        } else {
          handleError({
            errType: "statusChange",
            error: "Couldn't mark complete",
          });
        }
      })
      .catch((error) => {
        handleError({
          errType: "statusChange",
          error: "Couldn't mark complete",
        });
      });
  };

  const handleError = (error) => {
    console.log(error);
    //if the error was in setting a status
    if (error.errType === "statusChange") {
      props.passErrors({ type: "status", info: error.error });
    }
    //if error occured during automation process or check indicated incorrect work
    if (error.errType === "automation" || error.errType === "multiple") {
      handleAutoOrMultipleErr(error);
    }
    //if the checked work is incorrect
    if (error.errType === "check") {
      deleteItemsOnError(error.programs)
        .then((response) => {
          if (response.done) {
            error.errType = "automation";
            handleAutoOrMultipleErr(error);
          } else {
            error.errType = "multiple";
            handleAutoOrMultipleErr(error);
          }
        })
        .catch((error) => {
          error.errType = "multiple";
          handleAutoOrMultipleErr(error);
        });
    }
    //if a minor issue occurs like workfront post or status change at the end
    if (error.errType === "minor") {
      props.passErrors({ type: "minor", info: error.error || "" });
    }
  };

  const handleAutoOrMultipleErr = (error) => {
    //update the status to 'in progress errors'
    updateStatus(id, "APE").then((response) => {
      if (response.status === "APE") {
        props.changeStatus(response.status);
        props.changeStatusMessage("");
        props.passErrors({ type: error.errType, info: error.error });
      } else {
        props.changeStatus("APE");
        props.passErrors({ type: "multiple" });
      }
    });
  };

  const automation = async () => {
    return new Promise((resolve, reject) => {
      // resolve({ done: true });
      const url = "/api/auto/";
      const header = { "Content-Type": "application/json" };
      const data = {
        journeys: journeys,
        company: company,
        companyId: props.companyId,
        producerName: producerName,
        issueId: props.id,
        priority: props.info.priority,
      };
      fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            reject({ error: "automation request error" });
          }
          return response.json();
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const deleteItemsOnError = async (createdPrograms) => {
    return new Promise((resolve, reject) => {
      const url = "/api/auto/delete";
      const header = { "Content-Type": "application/json" };
      const data = {
        programs: createdPrograms,
      };
      fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            reject({ error: "error in deleting programs or projects" });
          }
          return response.json();
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const checkAutomationWork = async (createdPrograms) => {
    return new Promise((resolve, reject) => {
      const url = "/api/auto/check";
      const header = { "Content-Type": "application/json" };
      const data = {
        programs: createdPrograms,
      };
      fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            reject({ error: "automation check error" });
          }
          return response.json();
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject({ error: "automation check error" });
        });
    });
  };

  const postToWfIssue = async (createdPrograms) => {
    return new Promise((resolve, reject) => {
      const url = "/api/auto/issueNoteUpdate";
      const header = { "Content-Type": "application/json" };
      const data = {
        programs: createdPrograms,
        id: id,
      };
      fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            reject({ error: "error in posting update to workfront issue" });
          }
          return response.json();
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const closeTicket = () => {
    if (checkCanChangeStatus("AUC", status)) {
      updateStatus(id, "AUC")
        .then((response) => {
          if (response.status === "AUC") {
            props.changeStatus(response.status);
          } else {
            handleError({
              errType: "minor",
              error: "Couldn't close ticket, please contact Ops.",
            });
          }
        })
        .catch((error) => {
          handleError({ errType: "minor", error: error });
        });
    }
  };

  return (
    <Container maxWidth="100%" sx={{ backgroundColor: "#ECF0FF", padding: 2 }}>
      <Typography variant="h6" sx={{ paddingBottom: "15px" }}>
        Actions
      </Typography>
      <Button
        variant="contained"
        sx={{ marginRight: "17px" }}
        disabled={!canKickOff}
        onClick={kickOffProcess}
      >
        Start Automation
      </Button>
      {status === "AAC" && (
        <Button variant="contained" disabled={!canClose} onClick={closeTicket}>
          Close Ticket
        </Button>
      )}
    </Container>
  );
}
