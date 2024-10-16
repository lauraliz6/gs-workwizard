var express = require("express"),
  router = express.Router();

var sessionstorage = require("sessionstorage");
require("dotenv").config();

const host = process.env.HOST;
const wf_id = process.env.WF_CLIENT_ID;
const redirect_uri = process.env.REDIRECT_URI;
const frontend = process.env.FRONT_END_URL;

const {
  getTokens,
  handleTokenFromQueryParams,
  storeTokenData,
  signOut,
  storeUserData,
  checkAuthForApi,
} = require("./functions/authFn.js");

const { apiTest, userEmailTest } = require("./functions/apiFn.js");

router.get("/", async (req, res, next) => {
  const email = req.query.email;
  sessionstorage.setItem("email", email);
  try {
    res.redirect(
      `https://${host}/integrations/oauth2/authorize?client_id=${wf_id}&redirect_uri=${redirect_uri}/auth/callback&response_type=code`
    );
  } catch (error) {
    next(error);
  }
});

router.get("/callback", async (req, res, next) => {
  try {
    // ! get authorization token from request parameter
    const authorization_token = req.query.code;
    const tokens = await getTokens(authorization_token);
    if (!tokens) throw new Error("No auth code!");
    const handleTokens = await handleTokenFromQueryParams(tokens);
    if (!handleTokens.done) throw new Error("Tokens not fetched!");
    const storeTokens = await storeTokenData(
      handleTokens.access,
      handleTokens.refresh,
      handleTokens.expire
    );
    if (!storeTokens.done) {
      throw new Error("Failed to save tokens!");
    }
    const testEmail = await userEmailTest(
      handleTokens.access,
      sessionstorage.getItem("email")
    );
    if (!testEmail.done) {
      throw new Error("Failed to find user by email address");
    }
    const userInfo = testEmail.email.data[0];
    const storeUser = await storeUserData(userInfo);
    if (!storeUser.done) {
      throw new Error("Failed to save user credentials");
    }
    res.redirect(frontend);
  } catch (error) {
    //redirect to frontend error
    const errMsg = encodeURIComponent("Login error");
    signOut();
    res.redirect(`${frontend}error/${errMsg}`);
  }
});

router.get("/authorized", async (req, res) => {
  const token = sessionstorage.getItem("accessToken");
  if (token === null) {
    res.send("false");
  } else {
    res.send("true");
  }
});

//API CALL TEST
router.get("/apitest", async (req, res, next) => {
  try {
    const accessToken = await checkAuthForApi();
    const apiInfo = await apiTest(accessToken);
    res.send(apiInfo);
  } catch (error) {
    next(error);
  }
});

router.get("/logout", async (req, res, next) => {
  try {
    signOut();
    res.redirect(frontend);
  } catch (error) {
    next(error);
  }
});

//get currently logged in user
router.get("/user", async (req, res, next) => {
  const name = sessionstorage.getItem("userName") || "";
  const id = sessionstorage.getItem("userId") || "";
  const email = sessionstorage.getItem("email") || "";
  const userInfo = { name: name, id: id, email: email };
  res.send(userInfo);
});

module.exports = router;
