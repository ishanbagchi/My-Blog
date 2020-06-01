const express          = require("express");
const dotenv           = require("dotenv").config();
const bodyParser       = require("body-parser");
const mongoose         = require("mongoose");
const methodOverride   = require("method-override");
const expressSanitizer = require("express-sanitizer");
const app              = express();
const multer           = require("multer");

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: 'ishanbagchi', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// APP CONFIG
// var url = process.env.DATABASEURL || "mongodb://localhost:27017/blogapp";

var url = process.env.DATABASEURL || "mongodb://localhost:27017/blogapp";
mongoose.connect(url, {
	useNewUrlParser: true, 
	useCreateIndex: true,
	useUnifiedTopology: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //always goes after bodyParser
app.use(methodOverride("_method"));

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

// INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
})

// req.file.path
// CREATE ROUTE
app.post("/blogs", upload.single('image'), function(req, res){
	cloudinary.uploader.upload(req.file.path, function(result) {
  		// add cloudinary url for the image to the campground object under image property
  		req.body.blog.image = result.secure_url;
		req.body.blog.body = req.sanitize(req.body.blog.body);
  		Blog.create(req.body.blog, function(err, newBlog) {
    		if (err) {
      			console.log(err);
    		} else {
				res.redirect("/blogs");
			}
  		});
	});
	
	
	// //create blog
	// req.body.blog.body = req.sanitize(req.body.blog.body);
	// Blog.create(req.body.blog, function(err, newBlog){
	// 	if(err) {
	// 		console.log(err);
	// 	} else {
	// 		//redirect to the index
	// 		res.redirect("/blogs");
	// 	}
	// });
});

// SHOW ROUTE 
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	//destroy blogs
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("/blogs");
		} else {
			//redirect somewhere
			res.redirect("/blogs");
		}
	});
});

// LISTEN PORT
app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("App is running in 'https://myblog-wkntr.run-ap-south1.goorm.io'");
});