global.__rootdir = __dirname;

const express = require("express");
const path = require("path");

const {searchRounds} = require(path.join(__dirname, "src/db"));
const loader = require(path.join(__dirname, "src/load"));

loader.start();

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
	res.header("Content-Security-Policy", "default-src none; script-src 'self'; connect-src *; font-src *; style-src * 'unsafe-inline';");
	next();
});

app.get("/search", async (req, res) => {
  const {term, team, caseName} = req.query;
  console.log(`Searched for ${term}, ${team} / ${caseName}`);
  res.send(await searchRounds(term, team, caseName));
});

app.post("/update", (req, res) => {
	res.send({
		res: loader.update()
	});
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
