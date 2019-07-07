const pg = require("pg");
const {connectionString} = require("./config");

const client = new pg.Client({
  connectionString
});

client.connect();

module.exports = {
  addRound: (time, wiki, team, case_name, report, document) => {
    client.query("INSERT INTO rounds(time, wiki, team, case_name, report, document) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT ON CONSTRAINT uq DO NOTHING", 
      [time, wiki, team, case_name, report, document]
    )
  },
  searchRounds: (term, callback) => {
    client.query("SELECT * FROM rounds WHERE UPPER(report) LIKE UPPER('%' || $1 || '%') ORDER BY time DESC LIMIT 2500", 
      [term]
    )
    .then(res => callback(res.rows));    
  }
}
