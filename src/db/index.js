const pg = require("pg");
const {connectionString} = require("./config");

const client = new pg.Client({
  connectionString
});

client.connect();

module.exports = {
  addRound: (time, wiki, team, case_name, report, document, tournament) => {
    client.query("INSERT INTO rounds(time, wiki, team, case_name, report, document, tournament) VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT ON CONSTRAINT uq DO NOTHING", 
      [time, wiki, team, case_name, report, document, tournament]
    )
  },
  dropRound: (time, wiki, team, case_name, report, document, tournament) => {
    return client.query("DELETE FROM rounds WHERE time = $1 AND wiki = $2 AND team = $3 AND case_name = $4 AND report = $5 AND document = $6", 
      [time, wiki, team, case_name, report, document]
    )
  },
  searchRounds: (term, team, caseName, callback) => {
    client.query(`
      SELECT * FROM rounds 
      WHERE UPPER(report) LIKE UPPER('%' || $1 || '%') 
      AND UPPER(team) LIKE UPPER('%' || $2 || '%')
      AND UPPER(case_name) LIKE UPPER('%' || $3 || '%')
      ORDER BY time DESC 
      LIMIT 2500
      `, 
      [term, team, caseName]
    )
    .then(res => callback(res.rows));    
  },
  getAllRounds: (callback) => {
    client.query(`
      SELECT * FROM rounds
    `)
    .then(res => callback(res.rows));
  },
  updateDocument: (id, doc) => {
    return client.query(`
      UPDATE rounds
      SET document = $1
      WHERE id = $2
    `,
    [doc, id]
    );
  },
  countRounds: callback => {
    return client.query(`
      SELECT COUNT(*) FROM rounds
    `).then(res => callback(res.rows));
  }
}
