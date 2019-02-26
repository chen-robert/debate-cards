const pg = require("pg");
const client = new pg.Client({
  connectionString: process.env.DEBATE_CARDS_DB_URL || process.env.DATABASE_URL,
  ssl: false  
});

client.connect();

module.exports = {
  addRound: (time, team, case_name, report, document) => {
    client.query("INSERT INTO rounds(time, team, case_name, report, document) VALUES($1, $2, $3, $4, $5) ON CONFLICT ON CONSTRAINT uq DO NOTHING", 
      [time, team, case_name, report, document]
    )
  },
  searchRounds: (term, callback) => {
    client.query("SELECT * FROM rounds WHERE UPPER(report) LIKE UPPER('%' || $1 || '%') ORDER BY time DESC", 
      [term]
    )
    .then(res => callback(res.rows));    
  }
}
