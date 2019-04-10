const request = require("request-promise").defaults({ jar: true });
const parse = require("xml2js").parseString;
const path = require("path");

const {addRound} = require(__dirname + "/database.js");

const batchSize = 100;

const load = () => {
  let len = 0;
  const cases = [];
  const rounds = [];
  
  const processRounds = () => {
    if(rounds.length % 10 === 0) console.log(`${rounds.length} rounds left`);
    
    if(rounds.length === 0){
      return appendNext();
    }
    const roundName = rounds.pop();
    
    request(`${roundName}`)
      .then(html => {
        const data = parse(html, (err, res) => {
          const objData = {};
          res.object.property.forEach(property => objData[property["$"].name] = property.value);
          
          const {space, pageName, wiki} = res.object;
          
          addRound(new Date(objData["EntryDate"][0]).getTime(), wiki[0], space[0], pageName[0], objData["RoundReport"][0], objData["OpenSource"][0]);
          
          processRounds();
        });
      });
  }
  
  const processCases = () => {
    if(cases.length % 10 === 0) console.log(`${cases.length} cases left`);
    
    if(cases.length === 0){
      return processRounds();
    }
    const caseName = cases.pop();
    
    request(`${caseName}/objects/Caselist.RoundClass?number=100`)
      .then(html => {
        const data = parse(html, (err, res) => {
          try{
            res.objects.objectSummary.forEach(round => rounds.push(round.link[0]["$"].href));
          }catch(e){
            console.error(e);
          }
          
          processCases();
        });
      });
  }
  
  var appendNext = () => {
    console.log(`Loading #${len} cases`);
    
    request(`https://openev.debatecoaches.org/rest/wikis/query?q=object:Caselist.RoundClass%20AND%20attdate:[NOW/DAY-30DAYS%20TO%20NOW/DAY]&number=${batchSize}&type=solr&start=${len}`)
      .then(html => {
        len += batchSize;
        const data = parse(html, (err, res) => {
          res.searchResults.searchResult.forEach(res => cases.push(res.link[0]["$"].href));
          
          if(res.searchResults.searchResult.length != 0){
            processCases();
          }else{
            return;
          }
        });
      });
  }
  
  appendNext();
}

load();
