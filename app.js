const express = require("express");
const path = require("path");
const compression = require("compression");
const enforce = require("express-sslify");
const {listSchools, listCases, getData} = require(path.join(__dirname, "src/api.js"));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
if(process.env.NODE_ENV === "production"){
  app.use(enforce.HTTPS({trustProtoHeader: true}));
}

const data = {};
listSchools()
  .then(schools => {
    schools.each((i, {name, href}) => {
      setTimeout(() => {
        const schoolData = {};
        listCases(href)
          .then(cases => {
            cases.each((i, {caseName, caseHref}) => {
              getData(caseHref)
                .then(data => schoolData[caseName] = data);
            });
          })
          .catch(err => console.log(`Failed to load ${href}`));
        data[name] = schoolData;
        
        console.log(`Finished loading ${name}. ${i} out of ${schools.length}`);
      }, 1000 * i);
    });
  });
  

app.get("/data", (req, res) => res.send(data));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => res.redirect("/"));

app.listen(PORT, () => console.log(`Started server at port ${PORT}`));