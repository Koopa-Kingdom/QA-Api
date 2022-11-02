const path = require("dotenv")
const { Pool, client } = require('pg')

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT
})

pool.query('SELECT * FROM answers WHERE answers.question_id = 28', (err, res) => {
  if (err) {
    console.log(err)
  }
  console.log(res.rows)
})
