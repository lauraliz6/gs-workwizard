import React, { useState } from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import logo from "../assets/logo-full-02.png";
import { Button, MenuItem, TextField } from "@mui/material";

const styles = {
  leftItems: {
    display: "flex",
    alignItems: "center",
    paddingLeft: "15px",
  },
  rightItems: {
    display: "flex",
    alignItems: "center",
    paddingRight: "15px",
  },
  menuItem: {
    backgroundColor: "rgba(33, 150, 243, .16)",
    color: "#2196F3",
    height: "64px",
    padding: "0 33px",
    margin: "0 15px",
  },
};

function Header(props) {
  // CHANGE TO BLANK IN PROD
  const [loginEmail, setLoginEmail] = useState("workwizard@tivian.com");

  function login() {
    const encodedEmail = encodeURIComponent(loginEmail);
    window.location.href = `http://localhost:3000/auth?email=${encodedEmail}`;
  }

  return (
    <AppBar
      position="static"
      color="transparent">
      <Toolbar
        style={{ justifyContent: "space-between", padding: "0", margin: "0" }}>
        <div style={styles.leftItems}>
          <img
            src={logo}
            alt="WorkWizard logo"
            width="160"
            height="48"
          />
          <MenuItem
            style={styles.menuItem}
            onClick={() => (window.location.href = "http://localhost:5173")}>
            Home
          </MenuItem>
        </div>

        {props.auth && (
          <div style={styles.rightItems}>
            <Button
              variant="contained"
              padding="0 15px"
              onClick={() =>
                (window.location.href = "http://localhost:3000/auth/logout")
              }>
              Logout
            </Button>
            <Typography padding="0 15px">{props.username}</Typography>
          </div>
        )}
        {!props.auth && (
          <div style={styles.rightItems}>
            <TextField
              value={loginEmail}
              variant="outlined"
              label="Email address"
              size="small"
              style={{ margin: 10 }}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <Button
              variant="contained"
              padding="0 15px"
              onClick={login}
              disabled={loginEmail === ""}>
              Login
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
