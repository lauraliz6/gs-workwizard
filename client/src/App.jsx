//TODO - connect front-end error page to backend error handler
import { useEffect, useState } from "react";
import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import { myTheme } from "./MyTheme";

import Header from "./components/Header";
import Main from "./pages/Main";
import Error from "./pages/Error";
import Ticket from "./pages/Ticket";
import TempDataStructure from "./pages/Temp-DataStructure";

function MyApp() {
  const [auth, setAuth] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Username",
    id: 0,
    email: "null",
  });

  useEffect(() => {
    fetch("/api/auth/authorized")
      .then((response) => response.json())
      .then((data) => {
        setAuth(data);
      });
  }, []);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((response) => response.json())
      .then((data) => {
        setUserInfo(data);
      });
  }, []);

  return (
    <ThemeProvider theme={myTheme}>
      <div className="App">
        <Header
          auth={auth}
          username={userInfo.name}
        />
        {auth && (
          <Routes>
            <Route
              path="/"
              element={<Main />}
            />
            <Route
              path="/ticket/:id"
              element={<Ticket producer={userInfo} />}
            />
            <Route
              path="/error/:error"
              element={<Error />}
            />
            <Route
              path="/data"
              element={<TempDataStructure />}
            />
          </Routes>
        )}
      </div>
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <MyApp />
    </BrowserRouter>
  );
}
