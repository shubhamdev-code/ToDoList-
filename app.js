const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const tasks = ["Wake Up"];
const workItems = [];

app.get("/", function (req, res) {
  const day = date.getDate();

  res.render("list", { listTitle: day, newListItem: tasks });
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItem: workItems });
});

app.post("/", function (req, res) {
  if (req.body.list === "Work") {
    workItems.push(req.body.newItem);
    res.redirect("/work");
  } else {
    tasks.push(req.body.newItem);
    res.redirect("/");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
