const {getAllRounds, updateDocument} = require(__dirname + "/db");
const request = require("request");
const {URL} = require("url");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const bestGuess = "19";
// Try the best guess + original url
let extensions = [bestGuess, ""];
for(let i = 13; i <= 25; i++) extensions.push(i + "");
extensions = extensions.filter((i, idx, arr) => arr.indexOf(i) === idx);

const fixUrl = urlStr => {
  return new Promise(async (resolve, reject) => {
    const url = new URL(urlStr);
    const firstPart = url.host.split(".")[0];
    const ending = url.host.split(".").slice(1).join(".");
    
    if(firstPart.replace(/[a-z]/g, "").length !== 0) return resolve({urlStr});

    const fixed = extensions
      .map(ext => firstPart + ext + "." + ending);
    
    const isValid = host => {
      const baseUrl = new URL(urlStr);
      baseUrl.host = host;

      return new Promise((resolve, reject) => {
        request({
          method: "HEAD",
          uri: baseUrl.href,
          rejectedUnauthorized: false
        }, (err, resp) => {
          if(err) return reject(err);
          return resolve({valid: resp.statusCode === 200, url: baseUrl.href});
        });
      });
    }
    for(let i = 0; i < fixed.length; i++) {
      const data = await isValid(fixed[i]);
      if(data.valid) return resolve({urlStr: data.url});
    }
    console.error(`No valid matches for ${urlStr}`);
    return resolve({urlStr});
  });
}

getAllRounds(async allRounds => {
  for(var i = 0; i < allRounds.length; i++) {
    if (allRounds[i].document.length !== 0) {
      const url = new URL(allRounds[i].document);
      const wikiName = allRounds[i].wiki;

      if(wikiName.startsWith("hs")) url.host = wikiName + ".debatecoaches.org";
      else url.host = wikiName + ".paperlessdebate.com";
      
      const urlStr = url.href;
      if(urlStr !== allRounds[i].document) {
        console.log(`Updating ${urlStr}`);
        await updateDocument(allRounds[i].id, urlStr);
      }
    }
  }
  console.log("done");
});
