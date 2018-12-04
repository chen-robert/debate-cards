const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require("express-sslify");

const db = require(path.join(__dirname, "src/database.js"));
const load = require(path.join(__dirname, "src/load.js"));
const {cleanData} = require(path.join(__dirname, "src/util.js"))

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
if(process.env.NODE_ENV === "production"){
  app.use(enforce.HTTPS({trustProtoHeader: true}));
}

db.getData()
  .then(data => {
    data = data || {};
    setInterval(() => console.log("Saving Data") || db.setData(data), 1 * 60 * 1000);

    load(data, "https://hspolicy.debatecoaches.org");
    load(data, "https://hsld.debatecoaches.org/");
    load(data, "https://opencaselist.paperlessdebate.com");

    app.get("/data", (req, res) => res.send(cleanData(data)));
    app.use(express.static(path.join(__dirname, "public")));
    app.get("*", (req, res) => res.redirect("/"));

    app.listen(PORT, () => console.log(`Started server at port ${PORT}`));
  })
  .catch(err => console.error(err.stack));
