console.log("script.js loaded");

getBackEnd();

async function getBackEnd() {
  const response = await fetch("/backend");
  const data = await response.json();
  console.log(data);
}

checkAuth();

async function checkAuth() {
  const response = await fetch("/authorized");
  const data = await response.json();
  document.querySelector("#authorized").innerText = data;
  if (data) {
    document.querySelector("#api").style.display = "block";
  } else {
    document.querySelector("#auth").style.display = "block";
  }
}

async function apiTest() {
  const response = await fetch("/auth/apitest");
  const data = await response.json();
  console.log(data);
}

document.querySelector("#api-btn").addEventListener("click", () => {
  apiTest();
});
