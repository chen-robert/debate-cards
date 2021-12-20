const flat = true;
const resultElem = document.getElementById(flat? "results2": "results");

document.getElementById("refreshBtn").onclick = async () => {
	const { res } = await (await fetch("/update", { method: "POST" })).json();

	alert(res ? "Starting new update cycle": "Update cycle in progress");
}

const resultTemplate = (wiki, school, caseName, report, doc, time, tournament) => {
	if(wiki === "opencaselist19") {
		docUrl = new URL(doc)

		if(docUrl.host === "opencaselist.paperlessdebate.com") {
			docUrl.host = "opencaselist19.paperlessdebate.com"
		}

		doc = docUrl.toString()
	}

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

	const date = new Date(+time);

	return `
	<tr>
		<td>${date.toLocaleDateString()}</td>
		<td style="width: 25px">${wiki}</td>
		<td style="width: 150px">${school} ${caseName}</td>
		<td style="width: 150px">${tournament}</td>
		<td>${side}</td>
		<td style="width: 150px"><a href="${doc}">${decodeURIComponent(docName)}</a></td>
		<td style="text-align: left; width: 100%">${report}</td>
	</tr>
	`;
}
let timeouts = [];

window.onload = () => {
  const check = e => {
    if(e.keyCode === 13){
      const filterText = wikiName.value;

      while(resultElem.firstChild) {
        resultElem.removeChild(resultElem.firstChild);
      }
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts = [];
      
      const settings = {
        showEmpty: document.getElementById("docs").checked,
      }
      
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          let items = JSON.parse(httpRequest.responseText)
            .filter(item => item.document.trim() !== "" || settings.showEmpty)
            .filter(item => item.wiki.includes(filterText))
            .filter(item => {
              const itemTime = new Date(+item.time);

              if (dateStart.value !== "") {
                if (itemTime < new Date(dateStart.value)) return false;
              }
              if (dateEnd.value !== "") {
                if (itemTime > new Date(dateEnd.value)) return false;
              }
              return true;
            })


          items = items.map(({wiki, team, case_name, report, document, time, tournament}) => resultTemplate(wiki, team, case_name, report, document, time, tournament));
            
      
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
}
