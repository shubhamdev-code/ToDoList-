//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect(
  "mongodb+srv://shubhamkrs:test132@cluster0.qhekpff.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

const itemSchema = {
  name: String,
};

const Item = mongoose.model("item", itemSchema);

const task1 = new Item({
  name: "Wake Up",
});

const task2 = new Item({
  name: "Get Up",
});

const task3 = new Item({
  name: "Have Breakfast",
});

const defaultItems = [task1, task2, task3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
  Item.find({})
    .then((items) => {
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Inserted Success");
          })
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
        console.log("Doesn't exist!");
      } else {
        //Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => console.log(err));
});

app.post("/", function (req, res) {
  const task = req.body.newItem;
  const listName = req.body.list;

  const newTask = new Item({
    name: task,
  });

  if (listName == "Today") {
    newTask.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(newTask);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedTaskId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == "Today") {
    Item.findByIdAndRemove(checkedTaskId)
      .then(() => console.log("Task Removed"))
      .catch((err) => console.log(err));

    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedTaskId } } }
    )
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
