const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const connection = mongoose.connection;

connection.on("errror", (err) => console.error(err));
connection.on("close", () => console.log("Connection closed with database"));
connection.once("open", () =>
  console.log("Connection established with database")
);
