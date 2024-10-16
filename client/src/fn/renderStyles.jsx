import { statusLabels, priorityLabels } from "./wfCodes";
import { Chip, Link } from "@mui/material";
import { toTitleCase } from "./utils";

export const renderStatusCell = (params) => {
  const { value } = params;

  return (
    <Chip
      label={statusLabels.find((x) => x.status === value)?.label ?? value}
      sx={statusLabels.find((x) => x.status === value)?.sx ?? {}}
      variant="outlined"
    />
  );
};

export const renderTicketName = (params) => {
  const { id, ticketName } = params.row;
  return <Link href={`/ticket/${id}`}>{ticketName}</Link>;
};

export const renderPriority = (params) => {
  const { value } = params;
  return (
    <Chip
      sx={{
        backgroundColor:
          priorityLabels.find((x) => x.num === value)?.color ?? "black",
        color: "white",
      }}
      label={priorityLabels.find((x) => x.num === value)?.label ?? "label"}
    />
  );
};

export const renderArr = (params) => {
  const { value } = params;
  if (!Array.isArray(value)) {
    return toTitleCase(value);
  }
  const newArr = [];
  value.forEach((val) => {
    if (val !== null) {
      const title = toTitleCase(val);
      newArr.push(title);
    }
  });
  let arrStr = "";
  if (newArr.length > 1) {
    arrStr = newArr.join(", ");
  } else if (newArr.length === 1) {
    arrStr = newArr[0];
  }
  return arrStr;
};

export const renderBool = (params) => {
  const { value } = params;
  if (value) {
    return "Yes";
  } else {
    return "No";
  }
};
