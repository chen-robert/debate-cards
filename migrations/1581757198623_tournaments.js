/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.dropConstraint("rounds", "uq")
  pgm.addColumns("rounds", {
    tournament: {
      type: "string"
    }
  });
  pgm.addConstraint("rounds", "uq", {
    unique: ["time", "team", "case_name", "report", "document", "tournament"]
  });
};

exports.down = pgm => {
  pgm.dropConstraint("rounds", "uq")
  pgm.dropColumns("rounds", ["tournament"]);
  pgm.addConstraint("rounds", "uq", {
    unique: ["time", "team", "case_name", "report", "document"]
  });
};
