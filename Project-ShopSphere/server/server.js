console.log("JWT SERVER CODE STARTED ✅");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = "shopsphere_secret_key";

app.use((req, res, next) => {
  console.log("REQUEST CAME:", req.method, req.url);
  next();
});

mongoose
  .connect("mongodb://127.0.0.1:27017/ShopSphere")
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

const ProductSchema = new mongoose.Schema({
  name: String,
  new_price: Number,
  category: String,
  image: String,
});

const Product = mongoose.model("Product", ProductSchema);

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

app.get("/", (req, res) => {
  res.send("ShopSphere JWT Backend is running ✅");
});

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    console.log("SIGNUP REQUEST RECEIVED:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    console.log("SIGNUP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Signup error",
      error: error.message,
    });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    console.log("LOGIN REQUEST RECEIVED:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message,
    });
  }
});

// ADD PRODUCT
app.post("/addproduct", async (req, res) => {
  try {
    console.log("ADD PRODUCT REQUEST RECEIVED:", req.body);

    const product = new Product({
      name: req.body.name,
      new_price: req.body.new_price,
      category: req.body.category,
      image: req.body.image || "",
    });

    await product.save();

    res.json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    console.log("ADD PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message,
    });
  }
});

// GET PRODUCTS
app.get("/products", async (req, res) => {
  try {
    console.log("GET PRODUCTS");

    const products = await Product.find();

    res.json(products);
  } catch (error) {
    console.log("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// UPDATE PRODUCT
app.put("/updateproduct/:id", async (req, res) => {
  try {
    console.log("UPDATE PRODUCT REQUEST:", req.params.id, req.body);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        new_price: req.body.new_price,
        category: req.body.category,
        image: req.body.image || "",
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Product Updated",
      product: updatedProduct,
    });
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
});

// DELETE PRODUCT
app.delete("/deleteproduct/:id", async (req, res) => {
  try {
    console.log("DELETE PRODUCT REQUEST:", req.params.id);

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000 ✅");
});