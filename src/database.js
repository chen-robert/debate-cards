const pg = require("pg");
const client = new pg.Client({
  connectionString: process.env.DEBATE_CARDS_DB_URL || process.env.DATABASE_URL,
  ssl: false  
});

console.log(process.env.DEBATE_CARDS_DB_URL);

client.connect();

client.query("CREATE TABLE data(text JSONB)")
  .then(() => console.log("Created table data"))
  .catch(() => {});

module.exports = {
  setData: data => {
    client.query("DELETE FROM data")
      .then(() => client.query("INSERT INTO data(text) VALUES($1) RETURNING *", [data]))
      .catch(err => console.error(err.stack));
  },
  getData: () => {
    return client.query("SELECT text FROM data LIMIT 1")
      .then(res => res.rows[0] && res.rows[0].text)
      .catch(err => console.error(err.stack));
  }
}
