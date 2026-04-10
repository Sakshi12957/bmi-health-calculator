const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/bmiDB")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  bmiRecords: []
});

const User = mongoose.model("User", userSchema);

// Auth
function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.json({msg:"No token"});
  try{
    const data = jwt.verify(token,"secret");
    req.user = data;
    next();
  }catch{
    res.json({msg:"Invalid token"});
  }
}

// REGISTER
app.post("/register", async (req,res)=>{
  const {username,email,password} = req.body;
  const hash = await bcrypt.hash(password,10);
  await User.create({username,email,password:hash});
  res.json({msg:"Registered"});
});

// LOGIN
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.json({msg:"User not found"});

  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.json({msg:"Wrong password"});

  const token = jwt.sign({id:user._id},"secret");
  res.json({token});
});

// BMI (FINAL FIXED)
app.post("/bmi", auth, async (req,res)=>{

  let {height, weight} = req.body;

  height = parseFloat(height);
  weight = parseFloat(weight);

  // 👉 FIX: cm to meter conversion
  if(height > 3){
    height = height / 100;
  }

  if(!height || !weight){
    return res.json({msg:"Invalid input"});
  }

  const bmi = weight / (height * height);

  let category="", advice="", eat=[], avoid=[];

  if(bmi < 18.5){
    category="Underweight";
    advice="Increase calorie intake.";
    eat=["Milk","Banana","Paneer","Rice","Dry fruits"];
    avoid=["Skipping meals"];
  }
  else if(bmi >= 18.5 && bmi < 25){
    category="Normal";
    advice="Maintain your healthy lifestyle.";
    eat=["Fruits","Vegetables","Protein food"];
    avoid=["Too much junk"];
  }
  else if(bmi >= 25 && bmi < 30){
    category="Overweight";
    advice="Exercise and control diet.";
    eat=["Salad","Oats","Green tea"];
    avoid=["Fried food","Sugar"];
  }
  else{
    category="Obese";
    advice="Strict diet and workout needed.";
    eat=["Soup","Vegetables","Low calorie food"];
    avoid=["Junk food","Oil","Sugar"];
  }

  const user = await User.findById(req.user.id);
  user.bmiRecords.push({height,weight,bmi,category});
  await user.save();

  res.json({
    bmi,
    category,
    advice,
    eat,
    avoid
  });
});

// Start
app.listen(5000,()=>console.log("Server running on 5000"));