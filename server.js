require('dotenv').config();
const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');

//static files
app.use(express.static(__dirname + "/public"));

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

//middleware for the session
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 60000},
  store: new MongoStore({
    mongoUrl: 'mongodb+srv://hadajunior5:W2Izcs89dsPIqwwq@mongodb-demo.xjcty6t.mongodb.net/userMERN?retryWrites=true&w=majority',
    ttl: 14 * 24 * 60 * 60
  }),
}));

//view engine setup ejs
app.set("view engine", "ejs");

//pass json data
app.use(express.json());

//pass form data
app.use(express.urlencoded({ extended: true }));

//middleware to check if the user is connected or not
const protected = (req, res, next) => {
  if(!req.session.loginUser){
    return res.render('notAllowed');
  }
  next();
}

//routes
app.get("/", (req, res) => {
  ///console.log(req.session);
  res.render("index");
});

//get the login form
app.get("/login", (req, res) => {
  res.render("login");
});

//get for the logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
})

app.get("/protected", protected, (req, res) => {
  const id = req.session.loginUser._id;
  res.render("protected", {identifiant: id});
});

//login an user who's registered in our database
app.post("/login", async (req, res) => {  
  try {
  const userFound = await User.findOne({username: req.body.username});

  let isPasswordValid = bcrypt.compare(req.body.password, userFound.password);

  req.session.loginUser = userFound;

  if ( isPasswordValid ){
    
    return res.redirect(`/profile/${userFound._id}`);
  };

  res.send('Bad credentials' );

  } catch (error) {
    console.log(error);
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
  }).then(user => { 
    res.redirect(`/profile/${user._id}`); 
  })
  .catch(error => { res.send(error); });
});

//profile
app.get("/profile/:id", protected, async (req, res) => {
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
