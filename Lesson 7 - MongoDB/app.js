const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const app = express();

// connect to db
const dbURI =
  "mongodb+srv://yanuarchr:3nt0D123@nodetuts.rre7v3v.mongodb.net/node-tuts?retryWrites=true&w=majority&appName=nodetuts";
mongoose
  .connect(dbURI)
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));

// register view engine
app.set("view engine", "ejs");

// using static files
app.use(express.static("public"));

// logger middleware
app.use(morgan("dev"));

// index
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

// about
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// create
app.get("/blogs/create", (req, res) => {
  res.render("create", { title: "Create a new blog" });
});

app.get("/blogs", (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "All Blogs", blogs: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

// default
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
