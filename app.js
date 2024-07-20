import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./database/models/User.js";

dotenv.config();

const app = express();

app.use(express.json());

const port = 8080;

var salt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.ACCESS_TOKEN;

const calculateAge = (dob) => {
  // Get time difference in milliseconds
  const diff = Date.now() - new Date(dob).getTime();

  // Convert milliseconds to years
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age;
};

// Middleware to authenticate using JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer token"

  if (token == null)
    return res.status(401).json({ message: "Token is missing" });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
};

app.get("/test", (req, res) => {
  res.json("test ok");
});

// POST /login endpoint
app.post("/login", async (req, res) => {
  // Extract user data from the request body
  const userData = req.body;
  const { email, password } = userData;
  
  try {
    // Find user by email
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      // Check if the password matches with the hashed password in the database
      const checkPass = bcrypt.compareSync(password, user.password);
      if (checkPass) {
        // Generate a JWT token with the user's email and ID, valid for 1 hour
        const token = jwt.sign(
          {
            email: user.email,
            id: user._id,
          },
          jwtSecret,
          { expiresIn: "1h" }
        );

        // Send the token and user data in the response
        res.json({ token, user });
      } else {
        // Password incorrect
        console.log("Password is incorrect");
        res.status(422).json("password not matched");
      }
    } else {
      // User not found
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    // Handle server error
    res.status(500).json({ message: error.message });
  }
});

// POST /signup endpoint
app.post("/signup", async (req, res) => {
  // Extract user data from the request body
  const userData = req.body;  
  const { phone, email, name, dob, monthlySalary, password } = userData;
  try {
    // Calculate user's age from their date of birth
    const age = calculateAge(dob);  
    
    // Check if user meets age and salary criteria
    if (age < 20 || monthlySalary < 25000) {
      // If the user does not meet the criteria, send a 400 Bad Request response
      return res
        .status(400)
        .json({ message: "User does not meet the criteria" });
    }

    // Create a new user in the database with the provided data
    // Hash the password before storing it for security purposes        
    const newUser = await User.create({
      phone,
      email,
      name,
      dob,
      monthlySalary,
      password: bcrypt.hashSync(password, salt), // Hash the password
      purchasePower: 0, // Initialize purchase power to 0
    });
    
    // Respond with success message
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    // Respond with error message in case of failure
    res.status(500).json({ message: error.message });
  }
});

// GET /user endpoint with authenticateToken middleware
app.get("/user", authenticateToken, async (req, res) => {
  try {
    // Find the user by ID from the database, excluding the password 
    const user = await User.findById(req.user.id).select("-password");
    // Send the user data as a JSON response
    res.json(user);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
});

// POST /borrow endpoint
app.post("/borrow", authenticateToken, async (req, res) => {
  // Extract the borrowed amount from the request body
  const { amount } = req.body;
  try {
    // Find the user using the ID from the authenticated token
    const user = await User.findById(req.user.id);

    // Update Purchase Power amount
    user.purchasePower += amount;

    // Calculate repayment details
    const interestRate = 0.08; //set interest rate as 8%
    const monthlyRepayment = (amount * (1 + interestRate)) / 12;

    // Save the updated user document to the database
    await user.save();
    // Send a JSON response with the updated purchase power and monthly repayment details
    res.json({
      purchasePower: user.purchasePower,
      monthlyRepayment,
    });
  } catch (error) {
    // Respond with an error message if something goes wrong
    res.status(500).json({ message: error.message });
  }
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Error connecting to MongoDb");
  }
  app.listen(port, () => {
    console.log(`Server started on port: http://localhost:${port}/`);
  });
};

startServer();
