const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const axios = require("axios");
const cheerio = require("cheerio");

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

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(express.json());

// routes
app.use("/api", authRoutes);
app.use("/api/addshare", addShareRoutes);

//web-scraping
axios("https://www.moneycontrol.com/news/business/stocks/")
  .then((res) => {
    const htmlData = res.data;
    const articles = []
    const $ = cheerio.load(htmlData);
    $(".clearfix", htmlData).each((index, element) => {
      const title = $(element).children("h2").text();
      const titleUrl = $(element).children("a").attr("href");
      const imageUrl = $(element).children("a").children("img").attr("data");
      if (
        title !== undefined &&
        titleUrl !== undefined &&
        imageUrl !== undefined
      ) {
        articles.push({
          title,
          titleUrl,
          imageUrl,
        });
      }
    });
    app.get("/news", (req,res)=>{
      res.send(articles)
    })
  })
  .catch((err) => {
    console.error(err);
  });

  
