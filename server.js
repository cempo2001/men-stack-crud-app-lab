const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]); // zbog SRV problema u tvojoj mreži

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const app = express();

// Konekcija na bazu
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Import modela
const Plant = require("./models/plant.js");

// Middleware (iznad ruta)
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// Test ruta
app.get("/test", (req, res) => {
  res.send("Server is running");
});

// GET /
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

// GET /plants  (Index)
app.get("/plants", async (req, res) => {
  const allPlants = await Plant.find();
  res.render("plants/index.ejs", { plants: allPlants });
});

// GET /plants/new  (New) - mora biti iznad /plants/:plantId
app.get("/plants/new", (req, res) => {
  res.render("plants/new.ejs");
});

// POST /plants  (Create)
app.post("/plants", async (req, res) => {
  await Plant.create(req.body);
  res.redirect("/plants");
});

// GET /plants/:plantId  (Show)
app.get("/plants/:plantId", async (req, res) => {
  const foundPlant = await Plant.findById(req.params.plantId);
  res.render("plants/show.ejs", { plant: foundPlant });
});

// GET /plants/:plantId/edit  (Edit)
app.get("/plants/:plantId/edit", async (req, res) => {
  const foundPlant = await Plant.findById(req.params.plantId);
  res.render("plants/edit.ejs", { plant: foundPlant });
});

// PUT /plants/:plantId  (Update)
app.put("/plants/:plantId", async (req, res) => {
  await Plant.findByIdAndUpdate(req.params.plantId, req.body);
  res.redirect(`/plants/${req.params.plantId}`);
});

// DELETE /plants/:plantId  (Destroy)
app.delete("/plants/:plantId", async (req, res) => {
  await Plant.findByIdAndDelete(req.params.plantId);
  res.redirect("/plants");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});