import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

import { toTitleCase } from "../../fn/utils";
import {
  renderStatusCell,
  renderPriority,
  renderArr,
  renderBool,
} from "../../fn/renderStyles";

const tableHeadStyle = {
  backgroundColor: "#D9D9D9",
  fontSize: 14,
  fontWeight: "bold",
};

const tableCellStyle = { backgroundColor: "#EFEFEF", fontSize: 14 };

const updateDetails = (details, status) => {
  return Object.keys(details).reduce((acc, key) => {
    const title = toTitleCase(key.replaceAll("_", " "));
    let data = details[key];
    if (key === "status") {
      data = renderStatusCell({ value: status });
    }
    if (key === "priority") {
      data = renderPriority({ value: data });
    }
    const reducedKeys = [
      "assignments_needed",
      "journey_type",
      "customer_reviews",
      "type_of_work",
      "level_of_customization",
    ];
    if (reducedKeys.includes(key)) {
      data = renderArr({ value: data });
    }
    if (key === "turn_current" || key === "to_translation") {
      data = renderBool({ value: data });
    }
    acc[title] = data;
    return acc;
  }, {});
};

const TicketDetails = (props) => {
  const [details, setDetails] = useState({});

  useEffect(() => {
    const updatedDetails = updateDetails(props.details, props.status);
    setDetails(updatedDetails);
  }, [props]);

  return (
    <Container
      maxWidth="false"
      sx={{ paddingTop: "25px" }}>
      <Typography variant="h6">Details</Typography>
      <Table>
        <TableBody>
          {Object.keys(details).map((key) => (
            <TableRow key={key}>
              <TableCell sx={tableHeadStyle}>{key}</TableCell>
              <TableCell sx={tableCellStyle}>{details[key]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default TicketDetails;
