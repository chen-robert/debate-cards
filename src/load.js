const path = require("path");
const api = require(path.join(__dirname, "api.js"));


const stack = [];
let doneLoading = 0;
let fnCount = 0;

module.exports = (data, apiBase = "https://hspolicy.debatecoaches.org") => {
  const {listSchools, listCases, getData} = api(apiBase);
  fnCount++;
  
  listSchools()
    .then(schools => {
      schools.each((i, {name, href}) => {
        setTimeout(() => {
          const schoolData = {};
          listCases(href)
            .then(cases => {
              stack.push(() => {
                cases.each((i, {caseName, caseHref}) => {
                  getData(caseHref)
                    .then(data => schoolData[caseName] = data)
                    .catch(err => console.log(`Failed to load ${caseHref}`));
                });
              });
            })
            .catch(err => console.log(`Failed to load ${href}`));
          data[name] = schoolData;
          
          if(i % 10 == 0){
            console.log(`Finished loading ${name}. ${i} out of ${schools.length}`);
          }
          
          if(i === schools.length - 1){
            doneLoading++;
          }
        }, 1500 * i);
      });
    });
}

const loadingInterval = setInterval(() => {
  const currFn = stack.pop();
  console.log(`Stack size: ${stack.length}`);
  
  if(currFn){
    currFn();
  }else if(fnCount !== 0 && doneLoading === fnCount){
    clearInterval(loadingInterval);
  }
}, 1000);