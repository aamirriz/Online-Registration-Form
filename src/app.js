require("dotenv").config();
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser = require("cookie-parser");
const auth = require("../src/middleware/auth");

require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.use(cookieParser());

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

//console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  // console.log(`this is the cookie awesome ${req.cookies.jwt}`);
  res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
  try {
    console.log(req.user);

    //single logout

    // req.user.tokens = req.user.tokens.filter((currElement) => {
    //   return currElement.token !== req.token;
    // });

    //logout from all devices

    req.user.tokens = [];

    res.clearCookie("jwt");
    console.log("logout successfully");

    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//create a new user in our database
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        age: req.body.age,
        password: password,
        confirmpassword: cpassword,
      });

      const token = await registerEmployee.generateAuthToken();

      //the res.cookie() function used to set the cookie name to value
      //the value parameter may be a string or object converted to JSON

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 30000),
        httpOnly: true,
      });

      console.log(cookie);

      const registered = await registerEmployee.save();
      res.status(201).render("index");
    } else {
      res.send("passwords are not matching");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

//login check

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    const token = await useremail.generateAuthToken();
    //console.log("the token part" + token);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 30000),
      httpOnly: true,
    });

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid login details");
    }
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`server is running at port no ${port}`);
});
