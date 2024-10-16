import React from "react";
import { useState, useEffect } from "react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { updateStatus } from "../../fn/workfront";
import { checkCanChangeStatus } from "../../fn/wfCodes";

export default function TicketPreview(props) {
  const [accordions, setAccordions] = useState();

  //use id to get needed template(s)
  const id = props.id;

  useEffect(() => {
    fetch(`/api/wf/templateProgram?id=${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const generated = generateAccordions(data);
        setAccordions(generated);
      })
      .catch((error) => {
        handlePreviewError(error);
      });
  }, []);

  const handlePreviewError = (error) => {
    props.passErrors({ type: "preview", info: error });
    if (checkCanChangeStatus("ANE", props.status)) {
      updateStatus(id, "ANE")
        .then((response) => {
          const statusChange = response.status;
          props.changeStatus(statusChange);
        })
        .catch((error) => {
          props.passErrors({
            type: "minor",
            info: "Failed to update status on WF",
          });
        });
    }
  };

  const accordionColors = {
    program: "#E4E4E4",
    project: "#F8F6F6",
    tasks: "#FFFFFF",
  };

  //return based on data
  const generateAccordions = (data) => {
    return data.map((item) => {
      return (
        <Accordion
          key={item.id}
          index={item.id}
          sx={{ backgroundColor: accordionColors[item.level] }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="create-program"
            id="create-program"
          >
            <Typography>
              <span
                style={{
                  color: "#037D00",
                }}
              >{`${item.type.toUpperCase()} - ${item.level.toUpperCase()}:`}</span>
              {` ${item.title.replace("Dummy Comp -", "")}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {item.detailType &&
              item.detailType === "obj" &&
              Object.entries(item.details).map(([key, value]) => (
                <Typography key={key}>{`${key
                  .replace("_", " ")
                  .toUpperCase()}: ${value}`}</Typography>
              ))}
            {item.detailType &&
              item.detailType === "arr" &&
              renderDetails(item.details, item.id)}
            {item.children &&
              item.children.length > 0 &&
              generateAccordions(item.children)}
          </AccordionDetails>
        </Accordion>
      );
    });
  };

  const renderDetails = (details, index) => {
    if (!details || details.length === 0) {
      return null;
    }

    return (
      <ul
        key={index}
        style={{
          fontFamily: "Roboto,Helvetica,Arial,sans-serif",
          margin: 0,
        }}
      >
        {details.map((detail, index) =>
          Array.isArray(detail) ? (
            renderDetails(detail, index)
          ) : (
            <li key={index}>{detail}</li>
          )
        )}
      </ul>
    );
  };

  return (
    <>
      <Typography variant="h6">Automation Preview</Typography>
      <div>{accordions}</div>
    </>
  );
}
