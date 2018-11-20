const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require("express-sslify");

const load = require(path.join(__dirname, "src/load.js"));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
if(process.env.NODE_ENV === "production"){
  app.use(enforce.HTTPS({trustProtoHeader: true}));
}

const data = require(path.join(__dirname, "src/data.json"));
load(data, "https://hspolicy.debatecoaches.org");
load(data, "https://opencaselist.paperlessdebate.com");


app.get("/data", (req, res) => res.send(data));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => res.redirect("/"));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));