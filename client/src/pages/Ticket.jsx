import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import TicketDetails from "../components/Ticket/TicketDetails";
import TicketActions from "../components/Ticket/TicketActions";
import TicketError from "../components/Ticket/TicketError";
import TicketPreview from "../components/Ticket/TicketPreview";
import BasicModal from "../components/Modal";
import { useParams } from "react-router-dom";

import { updateStatus } from "../fn/workfront";
import { checkCanChangeStatus } from "../fn/wfCodes";

const Ticket = (props) => {
  const { id } = useParams();
  const link = `https://guidespark.preview.workfront.com/issue/${id}/updates`;

  const producer = props.producer;

  const [ticketInfo, setTicketInfo] = useState({});
  const [status, setStatus] = useState("ANT");
  const [errors, setErrors] = useState({ type: "none" });
  const [companyId, setCompanyId] = useState();

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressModalMessage, setProgressModalMessage] = useState("");
  const [progressModalStatus, setProgressModalStatus] = useState("prog");

  const changeStatus = (status) => {
    setStatus(status);
  };

  useEffect(() => {
    if (status === "AIP") {
      setProgressModalOpen(true);
    } else {
      setProgressModalOpen(false);
    }
    if (status === "APE") {
      setErrors({ type: "automation" });
    }
  }, [status]);

  useEffect(() => {
    fetch(`/api/wf/issueDetails?id=${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setTicketInfo(data);
        setStatus(data.status);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  //checks for missing info
  useEffect(() => {
    //does portfolio exist?
    if (ticketInfo.hasOwnProperty("portfolio_name")) {
      const ticketStatus = ticketInfo.status;
      const portfolioName = ticketInfo.portfolio_name;
      checkForPortfolio(portfolioName)
        .then((response) => {
          const portfolio = response;
          //if yes, portfolio exist
          if (portfolio.exist) {
            //are all assignments accounted for?
            const neededAssignments = ticketInfo.assignments_needed;
            const portID = portfolio.data[0].ID;
            setCompanyId(portID);
            checkForAssignments(portID, neededAssignments).then((response) => {
              const missingAssignments = response;
              //if yes, all assignments accounted for
              if (
                Array.isArray(missingAssignments) &&
                missingAssignments.length === 0
              ) {
                //set ticket to ready
                setStatusToReady(ticketStatus);
              } else {
                //handle error - missing assignments
                handleMissingInfoError(
                  "assignments",
                  missingAssignments,
                  ticketStatus
                );
              }
            });
          } else {
            //handle error - missing portfolio
            handleMissingInfoError("portfolio", false, ticketStatus);
          }
        })
        .catch((error) => {
          console.log(error);
          handleMissingInfoError("portfolio", false, ticketStatus);
        });
    }
  }, [ticketInfo]);

  const checkForPortfolio = async (portfolioName) => {
    return new Promise((resolve, reject) => {
      fetch(`/api/wf/findPortfolio?name=${portfolioName}`)
        .then((response) => {
          if (!response.ok) {
            reject(null);
          }
          return response.json();
        })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          console.error(error);
          reject(null);
        });
    });
  };

  const checkForAssignments = async (portfolioId, neededAssignments) => {
    return new Promise((resolve, reject) => {
      fetch(`/api/wf/portAssignments?id=${portfolioId}`)
        .then((response) => {
          if (!response.ok) {
            reject(null);
          }
          return response.json();
        })
        .then((data) => {
          const existingAssignments = data;
          const missing = [];
          for (let i = 0; i < neededAssignments.length; i++) {
            if (
              existingAssignments.indexOf(neededAssignments[i]) <= -1 &&
              neededAssignments[i] === "art director"
            ) {
              missing.push(neededAssignments[i]);
            }
          }
          resolve(missing);
        })
        .catch((error) => {
          console.error(error);
          reject(null);
        });
    });
  };

  const handleMissingInfoError = (errorType, info, ticketStatus) => {
    setErrors({ type: errorType, info: info });
    if (checkCanChangeStatus("ANE", ticketStatus)) {
      updateStatus(id, "ANE")
        .then((response) => {
          const statusChange = response.status;
          setStatus(statusChange);
        })
        .catch((error) => {
          setErrors({ type: "minor", info: "Failed to update status on WF" });
        });
    }
  };

  const setStatusToReady = (ticketStatus) => {
    if (checkCanChangeStatus("ARA", ticketStatus) && errors.type === "none") {
      setErrors({ type: "none" });
      updateStatus(id, "ARA")
        .then((response) => {
          const statusChange = response.status;
          setStatus(statusChange);
        })
        .catch((error) => {
          setErrors({ type: "minor", info: "Failed to update status on WF" });
        });
    }
  };

  return (
    <Grid container columnSpacing={1}>
      <BasicModal
        open={progressModalOpen}
        button={false}
        heading={"Ticket In Progress"}
        body={progressModalMessage}
        canClose={status === "AIP" ? false : true}
        status={progressModalStatus}
      />
      <Grid item xs={12} sx={{ marginTop: 2, marginLeft: 1 }}>
        <Typography variant="h4">
          Ticket Info: <a href={link}>{id}</a>
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <TicketDetails details={ticketInfo} status={status} />
      </Grid>
      <Grid
        item
        container
        spacing={2}
        direction="column"
        xs={5}
        sx={{ marginTop: 5, marginLeft: 1 }}
      >
        <Grid item>
          <TicketActions
            status={status}
            id={id}
            changeStatus={changeStatus}
            changeStatusMessage={setProgressModalMessage}
            changeStatusIcon={setProgressModalStatus}
            info={ticketInfo}
            companyId={companyId}
            producer={producer}
            passErrors={setErrors}
          />
        </Grid>
        <Grid item>
          <TicketError errors={errors} />
        </Grid>
        <Grid item>
          {status !== "AAC" && status !== "AUC" && (
            <TicketPreview
              id={id}
              passErrors={setErrors}
              status={status}
              changeStatus={changeStatus}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Ticket;
