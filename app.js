//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-hemant-todolist:test123@cluster0.4sasd.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Click + to add new item."
});

const item3 = new Item({
  name: "<-- Click this to delete item."
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, founditems) {

    if (founditems.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log("error");
        } else {
          console.log("Successful");
        }
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: founditems
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemname = req.body.newItem;
  const listname = req.body.list;

  const item = new Item({
    name: itemname
  });


  if (listname === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listname
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listname);
    });
  }



});

app.post("/delete", function(req, res) {
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkeditemId, function(err) {
      if (!err) {
        console.log("Successful Deletion");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkeditemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }


});


app.get("/:customListname", function(req, res) {
  const customListname = _.capitalize(req.params.customListname);

  List.findOne({
    name: customListname
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log("not exist");
        //create a list
        const list = new List({
          name: customListname,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + customListname);
      } else {
        console.log("exist");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });




});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfuly");
});
