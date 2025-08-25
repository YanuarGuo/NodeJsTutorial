const express = require("express");
const app = express();

//listen for req
app.listen(3000);

// index
app.get("/", (req, res) => {
  res.sendFile("./views/index.html", { root: __dirname });
});

// about
app.get("/about", (req, res) => {
  res.sendFile("./views/about.html", { root: __dirname });
});

//redirect
app.get("/about-us", (req, res) => {
  res.redirect("/about");
});

//default
app.use((req, res) => {
  res.status(404).sendFile("./views/404.html", { root: __dirname });
});
