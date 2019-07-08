const resultElem = document.getElementById("results");
const resultTemplate = (wiki, school, caseName, report, doc) => `
  <div style="padding: 20px; border-radius: 15px; margin: 20px 0; background: #eee"> 
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h4>${wiki}</h4><h3>${school}, ${caseName}</h3>
      <a style="float: right" class="${doc.trim() === ""? "disabled": ""}" href="${doc || ""}" title="Download document"><i class="download"></i></a>
    </div>
    <p style="text-align: left; max-height: 250px; overflow-y: auto;">${report}</p>
  </div>
`;

let timeouts = [];

window.onload = () => {
  document.getElementById("search-box").onkeypress = function(e) {
    if(e.keyCode === 13){
      if(this.value === "")return;
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
            
      
          resultElem.insertAdjacentHTML("beforeend", `<i>${items.length} results found</i>`);
          items.forEach((html, i) => timeouts.push(setTimeout(() => resultElem.insertAdjacentHTML("beforeend", html), 10 * i)));
          
          this.value = "";
        }
      };
      const team = encodeURIComponent(document.getElementById("team").value);
      const caseName = encodeURIComponent(document.getElementById("caseName").value);
      httpRequest.open('GET', `/search?term=${encodeURIComponent(this.value)}&team=${team}&caseName=${caseName}`);
      httpRequest.send();           
    }
  }
  document.getElementById("options-button").onclick = () => {
    document.getElementById("options").classList.toggle("clicked");
  }
}