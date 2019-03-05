const express = require("express");
const path = require("path");

const {searchRounds} = require(path.join(__dirname, "src/database.js"));
const {cleanData} = require(path.join(__dirname, "src/util.js"))

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/search", (req, res) => {
  console.log(`Searched for ${req.query.term}`);
  searchRounds(decodeURIComponent(req.query.term), (data) => res.send(JSON.stringify(data)));
});
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
