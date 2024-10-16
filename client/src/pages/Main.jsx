import React from "react";
import Table from "../components/Table";
import { Container, Typography } from "@mui/material";

const Main = () => {
  return (
    <Container
      maxWidth="false"
      sx={{ paddingTop: "25px" }}>
      <Typography variant="h3">Tickets</Typography>
      <Table />
    </Container>
  );
};

export default Main;
