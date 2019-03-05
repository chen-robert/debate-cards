const { Client } = require("pg");
const async = require("async");
const connectionString = process.env.DEBATE_CARDS_DB_URL || process.env.DATABASE_URL;

console.log(connectionString);

const client = new Client({ connectionString });
client.connect();

const queries = [
  "DROP TABLE rounds",
  `CREATE TABLE rounds(
    id SERIAL PRIMARY KEY, 
    time BIGINT not null,
    wiki TEXT not null,
    team TEXT not null,    
    case_name TEXT not null,
    report TEXT not null,
    document TEXT not null,
    CONSTRAINT uq UNIQUE (time, team, case_name, report, document)
    )`
];

async.eachSeries(
  queries,
  (query, callback) => {
    client.query(query, (err, res) => {
      console.log(err ? err.stack : res.command);
      callback();
    });
  },
  err => {
    if (err) console.log(err);
    client.end();
  }
);
