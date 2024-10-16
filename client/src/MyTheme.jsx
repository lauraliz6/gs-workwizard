import { createTheme } from "@mui/material/styles";

export const myTheme = createTheme({
  chips: {
    new: { main: "#000000", bg: "#ffffff" },
    complete: { main: "#008100", bg: "#D2FFD4" },
    ready: { main: "#004ad9", bg: "#C3CFFB" },
    progress: { main: "#946900", bg: "#FFF8DA" },
    error: { main: "#b70000", bg: "#FFC1C1" },
    closed: { main: "#6a6b6a", bg: "#EAECEA" },
    urgent: "#ef0000",
    high: "#907400",
    normal: "#008900",
  },
  palette: {
    primary: {
      main: "#3898EC",
    },
  },
});
