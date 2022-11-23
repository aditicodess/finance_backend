const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const addShareRoutes = require("./routes/addShareRoutes");

const port = process.env.PORT || 8000;

// database connection
const dbURI =
  "mongodb+srv://aditi:lucknow@cluster0.ozq8fw3.mongodb.net/userInfo";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) =>
    app.listen(port, console.log(`Listening on port ${port}...`))
  )
  .catch((err) => console.log(err));

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api", authRoutes);
app.use("/api/addshare", addShareRoutes);
