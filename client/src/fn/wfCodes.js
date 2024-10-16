import { myTheme } from "../MyTheme";

export const statusLabels = [
  {
    status: "ANT",
    label: "New",
    sx: {
      color: myTheme.chips.new.main,
      backgroundColor: myTheme.chips.new.bg,
      borderColor: myTheme.chips.new.main,
    },
    allowChangeOn: [],
  },
  {
    status: "AAC",
    label: "Automation Complete",
    sx: {
      color: myTheme.chips.complete.main,
      backgroundColor: myTheme.chips.complete.bg,
      borderColor: myTheme.chips.complete.main,
    },
    allowChangeOn: ["AIP", "APE"],
  },
  {
    status: "AIP",
    label: "In Progress",
    sx: {
      color: myTheme.chips.progress.main,
      backgroundColor: myTheme.chips.progress.bg,
      borderColor: myTheme.chips.progress.main,
    },
    allowChangeOn: ["ARA"],
  },
  {
    status: "ANE",
    label: "New - Review Errors",
    sx: {
      color: myTheme.chips.error.main,
      backgroundColor: myTheme.chips.error.bg,
      borderColor: myTheme.chips.error.main,
    },
    allowChangeOn: ["ANT", "ARA"],
  },
  {
    status: "APE",
    label: "In Progress - Errors",
    sx: {
      color: myTheme.chips.error.main,
      backgroundColor: myTheme.chips.error.bg,
      borderColor: myTheme.chips.error.main,
    },
    allowChangeOn: ["AIP"],
  },
  {
    status: "ARA",
    label: "Ready for Automation",
    sx: {
      color: myTheme.chips.ready.main,
      backgroundColor: myTheme.chips.ready.bg,
      borderColor: myTheme.chips.ready.main,
    },
    allowChangeOn: ["ANT", "ANE"],
  },
  {
    status: "AUC",
    label: "Ticket Closed",
    sx: {
      color: myTheme.chips.closed.main,
      backgroundColor: myTheme.chips.closed.bg,
      borderColor: myTheme.chips.closed.main,
    },
    allowChangeOn: ["AAC"],
  },
];

export const checkCanChangeStatus = (goalStatus, curStatus) => {
  const goalStatusInfo = statusLabels.find(
    (status) => status.status === goalStatus
  );
  const allowChangeFrom = goalStatusInfo.allowChangeOn;
  if (allowChangeFrom.indexOf(curStatus) > -1) {
    return true;
  } else {
    return false;
  }
};

export const priorityLabels = [
  { num: 2, color: myTheme.chips.normal, label: "Normal" },
  { num: 3, color: myTheme.chips.high, label: "High" },
  { num: 4, color: myTheme.chips.urgent, label: "Urgent" },
];
