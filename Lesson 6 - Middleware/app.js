const express = require("express");
const morgan = require("morgan");
const app = express();

// register view engine
app.set("view engine", "ejs");

// listen for req
app.listen(3000);

// using static files
app.use(express.static("public"));

// logger middleware
app.use(morgan("dev"));

// index
app.get("/", (req, res) => {
  const blogs = [
    {
      title: "Yoshi finds eggs",
      snippet: "Lorem ipsum dolor sit amet consectetur",
    },
    {
      title: "Mario finds stars",
      snippet: "Lorem ipsum dolor sit amet consectetur",
    },
    {
      title: "How to defeat bowser",
      snippet: "Lorem ipsum dolor sit amet consectetur",
    },
  ];
  res.render("index", { title: "Home", blogs });
});

app.use((req, res, next) => {
  console.log("in the next middleware");
  next();
});

// about
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// create
app.get("/blogs/create", (req, res) => {
  res.render("create", { title: "Create a new blog" });
});

// default
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

//
