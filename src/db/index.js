const pg = require("pg");
const {connectionString} = require("./config");

const client = new pg.Client({
  connectionString
});

client.connect();

module.exports = {
  addRound: (time, wiki, team, case_name, report, document, tournament) => {
    return client.query("INSERT INTO rounds(time, wiki, team, case_name, report, document, tournament) VALUES($1, $2, $3, $4, $5, $6, $7)", 
      [time, wiki, team, case_name, report, document, tournament]
    )
  },
  dropRound: (time, wiki, team, case_name, report, document, tournament) => {
    return client.query("DELETE FROM rounds WHERE time = $1 AND wiki = $2 AND team = $3 AND case_name = $4 AND report = $5 AND document = $6", 
      [time, wiki, team, case_name, report, document]
    )
  },
  searchRounds: async (term, team, caseName) => {
    return (await client.query(`
      SELECT * FROM rounds 
      WHERE UPPER(report) LIKE UPPER('%' || $1 || '%') 
      AND UPPER(team) LIKE UPPER('%' || $2 || '%')
      AND UPPER(case_name) LIKE UPPER('%' || $3 || '%')
      ORDER BY time DESC 
      LIMIT 2500
      `, 
      [term, team, caseName]
    )).rows;
  },
  getAllRounds: async () => {
    return (await client.query(`
      SELECT * FROM rounds
    `)).rows;
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
  countRounds: async () => {
    const { rows } = await client.query(`
      SELECT COUNT(*) FROM rounds
    `);

		return rows[0].count;
  }
}
