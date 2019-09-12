const flat = new URLSearchParams(window.location.search).get("neo") != null;
const resultElem = document.getElementById(flat? "results2": "results");

const resultTemplate = (wiki, school, caseName, report, doc) => {

let side = "Unknown";
caseName = caseName.trim();
if(caseName.endsWith("Aff")) {
  caseName = caseName.substring(0, caseName.length - "Aff".length)
  side = "Aff";
} else if(caseName.endsWith("Neg")) {
  caseName = caseName.substring(0, caseName.length - "Neg".length)
  side = "Neg";
}

let idx = doc.lastIndexOf("/") + 1;
const docName = doc.substring(idx);

report = report.split("\n").join("<br>")

if(flat) return `
<tr>
  <td style="width: 25px">${wiki}</td>
  <td style="width: 150px">${school} ${caseName}</td>
  <td>${side}</td>
  <td style="width: 150px"><a href="${doc}">${decodeURIComponent(docName)}</a></td>
  <td style="text-align: left">${report}</td>
</tr>
`;

return `
  <div style="padding: 20px; border-radius: 15px; margin: 20px 0; background: #eee"> 
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h4>${wiki}</h4><h3>${school}, ${caseName}</h3>
      <a style="float: right" class="${doc.trim() === ""? "disabled": ""}" href="${doc || ""}" title="Download document"><i class="download"></i></a>
    </div>
    <p style="text-align: left; max-height: 250px; overflow-y: auto;">${report}</p>
  </div>
`;
}
let timeouts = [];

window.onload = () => {
  const check = (e) => {
    if(e.keyCode === 13){
      while(resultElem.firstChild) {
        resultElem.removeChild(resultElem.firstChild);
      }
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts = [];
      
      const settings = {
        showEmpty: document.getElementById("docs").checked,
        policyOnly: document.getElementById("policy").checked
      }
      
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          const items = JSON.parse(httpRequest.responseText)
            .filter(item => item.document.trim() !== "" || settings.showEmpty)
            .filter(item => !settings.policyOnly || item.wiki.includes("policy"))
            .map(({wiki, team, case_name, report, document}) => resultTemplate(wiki, team, case_name, report, document));
            
      
          document.getElementById("counter").innerText = `${items.length} results found`;
          items.forEach((html, i) => timeouts.push(setTimeout(() => resultElem.insertAdjacentHTML("beforeend", html), 1 * i)));
          
          document.getElementById("search-box").value = "";
        }
      };
      const term = encodeURIComponent(document.getElementById("search-box").value);
      const team = encodeURIComponent(document.getElementById("team").value);
      const caseName = encodeURIComponent(document.getElementById("caseName").value);
      httpRequest.open('GET', `/search?term=${term}&team=${team}&caseName=${caseName}`);
      httpRequest.send();           
    }
  }
  document.getElementById("search-box").onkeypress = check;
  document.getElementById("team").onkeypress = check;
  document.getElementById("caseName").onkeypress = check;

  document.getElementById("options-button").onclick = () => {
    document.getElementById("options").classList.toggle("clicked");
  }
}
