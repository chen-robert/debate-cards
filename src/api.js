const apiBase = "https://hspolicy.debatecoaches.org";
const request = require("request-promise").defaults({ jar: true });
const cheerio = require("cheerio");


module.exports = {
  listSchools: () => {
    return request(apiBase)
      .then(html => {
        const $ = cheerio.load(html);
        return $(".PanelsSchools .xwikipanelcontents a").map((i, elem) => {
            return {
              href: $(elem).attr("href"),
              name: $(elem).text()
            }
        });
      });
  },
  listCases: school => {
    return request(apiBase + school)
      .then(html => {
        const $ = cheerio.load(html);
        return $("#tblTeams td a").map((i, elem) => {
            return {
              caseHref: $(elem).attr("href"),
              caseName: $(elem).text()
            }
        });
      });
  },
  getData: url => {
    return request(apiBase + url)
      .then(html => {        
        const $ = cheerio.load(html);
        const rows = $("#tblRounds tr");
        const header = rows[0];
        
        let reportIndex, docIndex;
        
        $(header).children().each((i, elem) => {
          if($(elem).text() === "Round Report") reportIndex = i;
          if($(elem).text() === "Open Source") docIndex = i;
        });
        
        return rows.slice(1)
          .map((i, elem) => {
            const ret = {
              report: "",
              docUrl: undefined
            };
            
            const reportScript = $(
              $(elem).children()[reportIndex]
            ).find("img").attr("onclick");
            
            if(reportScript !== undefined){
              if(reportScript.startsWith("showReport('")){
                const reportNum = reportScript.substring(reportScript.indexOf("'") + 1, reportScript.lastIndexOf("'"));
                const reportText = $(`#report${reportNum}`).text();
                
                ret.report = reportText;
              }else{
                console.log(`Invalid url ${url}`);
              }
            }
            
            ret.docUrl = $(
              $(elem).children()[docIndex]
            ).find("a").attr("href");
            
            return ret;
          })
          .get();
      });
  }
}