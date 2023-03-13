const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
//connect to mongoose
mongoose
  .connect(
    'mongodb+srv://hadajunior5:W2Izcs89dsPIqwwq@mongodb-demo.xjcty6t.mongodb.net/userMERN?retryWrites=true&w=majority'
  )
  .then(() => console.log("Db connected"))
  .catch(err => console.log(err.message));

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  password: String,
  image: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_960_720.png"
  }
});

//model
const User = mongoose.model("User", userSchema);

//view engine setup ejs
app.set("view engine", "ejs");

//static files
app.use(express.static("public"));

//pass json data
app.use(express.json());

//pass form data
app.use(express.urlencoded({ extended: true }));

//routes
app.get("/", (req, res) => {
  res.render("index");
});

//login
app.get("/login", (req, res) => {
  res.render("login");
});

//Register
app.get("/register", (req, res) => {
  res.render("register");
});

//profile
app.get("/profile", (req, res) => {
  res.render("profile");
});

//listen
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
