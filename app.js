global.__rootdir = __dirname;

const express = require("express");
const path = require("path");

const {searchRounds} = require(path.join(__dirname, "src/db"));

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/search", (req, res) => {
  const {term, team, caseName} = req.query;
  console.log(`Searched for ${term}, ${team} / ${caseName}`);
  searchRounds(term, team, caseName, (data) => res.send(JSON.stringify(data)));
});
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
