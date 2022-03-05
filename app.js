const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Day = require("./date.js");
const _ = require("lodash");
require('dotenv').config(); 

const { Schema } = mongoose;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect(process.env.DBLINK);

const listSchema = new Schema({
  name: String,
});

const Item = mongoose.model("Item", listSchema);
const item1 = new Item({
  name: "Welcome to Your Toodo List",
});
const item2 = new Item({
  name: "Hit The + button to add new item.",
});
const item3 = new Item({
  name: "<--hit this to Delete an item.",
});

const defaultLists = [item1, item2, item3];

const customSchema = new Schema({
  name: String,
  items: [listSchema],
});

const List = mongoose.model("List", customSchema);

app.get("/", function (req, res) {
  const day = Day.getdate();
  Item.find({}, function (err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultLists, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted defualt list to db");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        title: day,
        day: "Today",
        list: foundItem,
      });
    }
  });
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) console.log(err);
      else {
        console.log("deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, founditem) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.post("/", function (req, res) {
  const listname = req.body.button;
  const newItem = new Item({
    name: req.body.newItem,
  });

  if (listname === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listname }, function (err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listname);
    });
  }
});

app.get("/:newList", function (req, res) {
  const newList = _.capitalize(req.params.newList);
  List.findOne({ name: newList }, function (err, foundList) {
    if (!err) {
      if (foundList) {
        res.render("list", {
          title: newList + "'s List",
          day: newList,
          list: foundList.items,
        });
      } else {
        const list = new List({
          name: newList,
          items: defaultLists,
        });
        list.save();
        res.redirect("/" + newList);
      }
    }
  });
});

app.listen(process.env.PORT, function () {
  console.log("serve started ");
});
