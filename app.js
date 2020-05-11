const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/blogapp", 
				{useNewUrlParser: true,
				 useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// LISTEN PORT
app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("App is running in 'https://myblog-wkntr.run-ap-south1.goorm.io'");
});