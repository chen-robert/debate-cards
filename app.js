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

const data = {};
const cleanData = data => {
  const ret = {};
  Object.keys(data).forEach(school => {
    ret[school] = {};
    Object.keys(data[school]).forEach(caseName => {
      const completeRounds = data[school][caseName].filter(round => round.docUrl !== undefined);
      if(completeRounds.length > 0){
        ret[school][caseName] = completeRounds;
      }
    });
    
    if(Object.keys(ret[school]).length === 0){
      delete ret[school];
    }
  });
  return ret;
}

const original = JSON.stringify(cleanData(data));
load(data, "https://hspolicy.debatecoaches.org");
load(data, "https://opencaselist.paperlessdebate.com");
load(data, "https://hspf.debatecoaches.org/");



app.get("/data", (req, res) => res.send(cleanData(data)));
app.get("/original", (req, res) => res.send(JSON.stringify(cleanData(data)) === original));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => res.redirect("/"));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
