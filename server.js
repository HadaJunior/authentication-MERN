const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
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

//get the login form
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/protected", (req, res) => {
  res.render("protected");
});

//login an user who's registered in our database
app.post("/login", async (req, res) => {  
  try {
  let userFound = await User.findOne({username: req.body.username});

  const isPasswordValid = await bcrypt.compare(req.body.password, userFound.password);

  if ( isPasswordValid ){
    return res.redirect(`/profile/${userFound._id}`)
  };

  res.send('Bad credentials' );

  } catch (error) {
    res.send(error);
  }
});

// get the register form
app.get("/register", (req, res) => {
  res.render("register");
});

//create a new user
app.post("/register", async (req, res) => {
  const { username, fullName, password } = req.body;

  //generate a salt, the more higher the salt the more secure the password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  User.create({
    username,
    fullName,
    password: hashedPassword
  }).then(user => { res.redirect(`/profile/${user._id}`); })
  .catch(error => { res.send(error); });
});

//profile
app.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    res.render("profile", { user });
  } catch (error) {
    res.send(error);
  }
});

//listen
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
