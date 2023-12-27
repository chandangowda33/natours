/* eslint-disable prettier/prettier */
//to link config.env to our project install dotenv by npm i dotenv
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//this should be above app coz first we need to add config
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

//this returns promise
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const app = require('./app');

//in  server.js we mainly add environment variable
//this shows on which environment its running
// console.log(app.get('env'));
//it will give all the envirnmental variable
// console.log(process.env);
//we can define our own enviromental variables so we use config.env

const port = process.env.PORT || 3000;

//to create server
app.listen(port, () => {
  console.log(`App running on the port ${port}`);
});
