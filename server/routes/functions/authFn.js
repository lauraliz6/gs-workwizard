const axios = require("axios");
var sessionstorage = require("sessionstorage");
require("dotenv").config();
const btoa = require("btoa");

const wf_id = process.env.WF_CLIENT_ID;
const wf_secret = process.env.WF_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const host = process.env.HOST;

const getTokens = async (theCode) => {
  return new Promise((resolve, reject) => {
    const url = `https://${host}/integrations/oauth2/api/v1/token`;
    const clientId = wf_id;
    const clientSecret = wf_secret;
    const base64Encoded = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    );
    const code = theCode;
    const redirectUrl = `${redirect_uri}/auth/callback`;
    const grantType = "authorization_code";

    axios
      .post(
        url,
        {
          code,
          grant_type: grantType,
          redirect_uri: redirectUrl,
        },
        {
          headers: {
            Authorization: `Basic ${base64Encoded}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//from https://levelup.gitconnected.com/handling-access-tokens-for-google-apis-with-react-node-js-tutorial-5ebf94d8f90f
const handleTokenFromQueryParams = async (tokens) => {
  return new Promise((resolve, reject) => {
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expirationDate = newExpirationDate(tokens.expires_in);
    if (accessToken && refreshToken) {
      resolve({
        done: true,
        access: accessToken,
        refresh: refreshToken,
        expire: expirationDate,
      });
    } else {
      reject({ done: false, err: "failed to handle tokens" });
    }
  });
};

//not exported
function newExpirationDate(expires) {
  const expirationTimestamp = Date.now() + expires * 1000;
  //FOR TESTING - EXPIRE IN 5 SECS
  // const expirationTimestamp = Date.now() + 5000;
  const expirationDate = new Date(expirationTimestamp);
  return expirationDate;
}

const storeTokenData = async (token, refreshToken, expirationDate) => {
  return new Promise((resolve, reject) => {
    if ((token, refreshToken, expirationDate)) {
      sessionstorage.setItem("accessToken", token);
      sessionstorage.setItem("refreshToken", refreshToken);
      sessionstorage.setItem("expirationDate", expirationDate);
      resolve({ done: true });
    } else {
      reject({ done: false, err: "failed to save tokens" });
    }
  });
};

//REFRESH TOKENS
const refreshTokens = async () => {
  return new Promise((resolve, reject) => {
    const refTok = sessionstorage.getItem("refreshToken");
    const data = {
      grant_type: "refresh_token",
      refresh_token: refTok,
    };
    const config = {
      headers: {
        Authorization: `Basic ${btoa(`${wf_id}:${wf_secret}`)}`,
        "Content-Type": "application/json",
      },
    };
    axios
      .post(`https://${host}/integrations/oauth2/api/v1/token`, data, config)
      .then((response) => {
        //pass back new tokens
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

//TODO -- PROBLEM WITH COMPARISON HERE
const checkExpiration = async () => {
  return new Promise((resolve, reject) => {
    let expired;
    const now = new Date(Date.now());
    const expDate = new Date(sessionstorage.getItem("expirationDate"));
    if (expDate && now > expDate) {
      expired = true; // token expired
    } else {
      expired = false; // valid token
    }
    resolve(expired);
  });
};

const checkAuthForApi = async () => {
  let access;
  //check if token has expired
  const expired = await checkExpiration();
  if (!expired) {
    //not expired, can use accessToken
    access = sessionstorage.getItem("accessToken");
    return access;
  }
  //if token HAS expired, refresh it -> return refreshed/not
  const refreshed = await refreshTokens();
  //3. then save the new tokens
  if (refreshed) {
    storeTokenData(
      refreshed.access_token,
      refreshed.refresh_token,
      newExpirationDate(refreshed.expires_in)
    );
    access = refreshed.access_token;
  }
  return access;
};

const signOut = () => {
  sessionstorage.clear();
};

const storeUserData = (data) => {
  return new Promise((resolve, reject) => {
    if (!data.ID || !data.name || !data || data.ID === "" || data.name === "") {
      reject({ done: false, error: "no user" });
    } else {
      sessionstorage.setItem("userId", data.ID);
      sessionstorage.setItem("userName", data.name);
      resolve({ done: true });
    }
  });
};

module.exports = {
  getTokens,
  handleTokenFromQueryParams,
  storeTokenData,
  refreshTokens,
  checkExpiration,
  signOut,
  storeUserData,
  checkAuthForApi,
};
