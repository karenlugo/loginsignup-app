const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
const mimeTypes = require("mime-types");

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));

// Set the MIME type for CSS files
app.use(
  express.static(publicPath, {
    setHeaders: (res, path) => {
      const mimeType = mimeTypes.lookup(path);
      if (mimeType === "text/css") {
        res.setHeader("Content-Type", mimeType);
      }
    },
  })
);

app.get("/", (req, res) => {
  res.render("login", { errorMessage: null, email: "", password: "" });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  app.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    if (!isValidEmail(email)) {
      return res.render("signup", {
        errorMessage: "Invalid email address!",
        firstName,
        lastName,
        email,
        password,
      });
    }
  
    // Check if email already exists in the database
    try {
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.render("signup", {
          errorMessage: "Email already exists. Please use a different email.",
          firstName,
          lastName,
          email,
          password,
        });
      }
    } catch (error) {
      console.log(error);
      return res.render("signup", {
        errorMessage: "Failed to create account.",
        firstName,
        lastName,
        email,
        password,
      });
    }
  
    const data = { firstName, lastName, email, password };
  
    try {
      await collection.insertMany([data]);
      res.render("signup", {
        successMessage: "Account created successfully!",
        isDisabled: true,
      });
    } catch (error) {
      console.log(error);
      res.render("signup", {
        errorMessage: "Failed to create account.",
        firstName,
        lastName,
        email,
        password,
      });
    }
  });
  

app.get("/login", (req, res) => {
  res.render("login", { errorMessage: null, email: "", password: "" });
});

app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ email: req.body.email });
    if (check.password === req.body.password) {
      res.render("home");
    } else {
      res.render("login", {
        errorMessage: "The password you’ve entered is incorrect.",
        email: req.body.email,
        password: "",
      });
    }
  } catch {
    res.render("login", {
      errorMessage: "The email you entered isn’t connected to an account.",
      email: req.body.email,
      password: "",
    });
  }
});

app.listen(3000, () => {
  console.log("port connected");
});
