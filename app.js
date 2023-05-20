const express = require("express");

const bodyParser= require("body-parser");
;
const mongoose = require("mongoose")

const _=require("lodash");

const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
    name:"Welcome to your todolist!"
});

const item2 = new Item ({
    name:"Hit the + button to add a new item."
});

const item3 = new Item ({
    name:"<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema={
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){
    Item.find()
    .then((foundItems) => {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems)
            .then(() => {
             console.log("Successfully inserted the items.");
             })
            .catch((error) => {
            console.error("Error inserting the items:", error);
            });
        
        res.redirect("/");
        }
        else{
        res.render("list", { listTitle: "Today", newListItems: foundItems });
        }
    })
    .catch((error) => {
      console.error("Error reading items:", error);
    });
    
});

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName})
    .then(function(foundList){
        
        if(!foundList){
            const list=new List({
                name:customListName,
                items:defaultItems
            });

            list.save();

            console.log("saved");

            res.redirect("/"+customListName);
        }
        else{
            res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
    })
})

app.post("/",function(req,res){
    const itemName =req.body.newItem;
    const listName=req.body.list;

    const item =new Item({
        name:itemName
    });

    if(listName==="Today"){

    item.save();
    res.redirect("/");

    }
    else{
        List.findOne({name:listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
});

app.post("/delete",function(req,res){  
     const checkeditemID=req.body.checkbox;
     const listName=req.body.listName;

     if(listName==="Today"){
        deleteCheckedItem();
     }else{
        deleteCustomItem();
     }

     async function deleteCheckedItem(){
        await Item.deleteOne({_id:checkeditemID});
        res.redirect("/");
     }

     async function deleteCustomItem(){
        await List.findOneAndUpdate(
            {name:listName},
            {$pull:{items:{_id:checkeditemID}}}
        );
        res.redirect("/"+listName);
     }
     });






app.listen(3000,function(){
    console.log("Server started on port 3000");
})

