import * as React from "react";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";

import {
  renderStatusCell,
  renderTicketName,
  renderPriority,
} from "../fn/renderStyles";

const columns = [
  { field: "ticketName", headerName: "Ticket Name", width: 500 },
  { field: "status", headerName: "Status", width: 200 },
  { field: "customer", headerName: "Customer", width: 150 },
  { field: "note", headerName: "Last Note: Note Text", width: 300 },
  { field: "priority", headerName: "Priority" },
];

const updatedColumns = columns.map((column) => {
  if (column.field === "status") {
    return {
      ...column,
      renderCell: renderStatusCell,
    };
  }
  if (column.field === "ticketName") {
    return {
      ...column,
      renderCell: (params) => renderTicketName(params),
    };
  }
  if (column.field === "priority") {
    return {
      ...column,
      renderCell: renderPriority,
    };
  }
  return column;
});

export default function DataTable() {
  const [rows, setRows] = useState([]);

  //useEffect to get list of issues - call backend
  useEffect(() => {
    fetch("/api/wf/myissues")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setRows(data);
      })
      .catch((error) => {
        // Handle error here
        console.error(error);
      });
  }, []);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={updatedColumns}
        pageSize={6}
        rowsPerPageOptions={[10]}
        sortModel={[
          {
            field: "priority",
            sort: "desc",
          },
        ]}
      />
    </div>
  );
}
