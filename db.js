// const path = require("dotenv")
// require('dotenv').config()
const path = require('path');
require('dotenv').config({ path:
path.join(__dirname, '.env') });
const { Pool, client } = require('pg')
const PORT = 3000;
const express = require("express");

const app = express();
console.log(process.env.PGUSER)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})

app.get('/qa/questions?:product_id', (req, res) => {
  pool.query(`select
json_build_object(
  'product_id', ${req.query.product_id},
  'results',
  (select json_agg(
    json_build_object(
      'question_id', q.id,
      'question_body', q.question_body,
      'question_date', q.date_written,
      'asker_name', q.asker_name,
      'asker_email', q.asker_email,
      'reported', q.reported,
      'question_helpfulness', q.question_helpfulness,
      'answers', (select
        json_object_agg(
        a.id,
        (select json_build_object(
          'id', a.id,
          'body', a.answer_body,
          'date', a.date_written,
          'answerer_name', a.answerer_name,
          'answerer_email', a.answerer_email,
          'reported', a.reported,
          'helpfulness', a.helpfulness,
          'photos', (select json_agg(
            json_build_object(
              'id', ap.id,
              'url', ap.url
            )
          ) from answers_photos ap where ap.answer_id = a.id)
          )
          )
          ) from answers a where a.question_id = q.id)
        )
    )from questions q where product_id = ${req.query.product_id})
  )`)
    .then((data) => {
      var results = data.rows[0].json_build_object
      res.end(JSON.stringify(results))
    })
})

app.get('/qa/questions/:question_id/answers', (req, res) => {

  pool.query(`(select
    json_object_agg(
    a.id,
    (select json_build_object(
      'id', a.id,
      'body', a.answer_body,
      'date', a.date_written,
      'answerer_name', a.answerer_name,
      'answerer_email', a.answerer_email,
      'reported', a.reported,
      'helpfulness', a.helpfulness,
      'photos', (select json_agg(
        json_build_object(
          'id', ap.id,
          'url', ap.url
        )
      ) from answers_photos ap where ap.answer_id = a.id)
      )
      )
      ) from answers a where a.question_id = ${req.params.question_id})`)
    .then((data) => {
      console.log(data.rows[0])
      var results = data.rows[0]
      // var question = req.params.question_id
      res.end(JSON.stringify(results))
    })
})

app.post('/qa/questions/', (req, res) => {
  pool.query(`insert into questions(question_body, date_written, asker_name, asker_email, product_id, reported, question_helpfulness)
    values('${req.body.body}', '${Date.now()}', '${req.body.name}', '${req.body.email}', '${req.body.product_id}', '0', '0') RETURNING id`)
    .then((data) => {
      res.end('question created successfully')
    })
})


app.post('/qa/questions/:question_id/answers', (req, res) => {
  pool.query(`insert into answers(question_id, answer_body, date_written, answerer_name, answerer_email, reported, helpfulness) values ('${req.params.question_id}', '${req.body.body}', '${Date.now()}', '${req.body.name}', '${req.body.email}', '0', '0') RETURNING id`)
    .then((data) => {
      req.body.photos.forEach((url) => {
        pool.query(`insert into answers_photos(answer_id, url) values ('${data.rows[0].id}', '${url}')`)
      })
    })
    .then((data) => {
      res.end('answer added successfully')
    })
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  pool.query(`UPDATE questions set reported = 1 where questions.id = ${req.params.question_id} returning id`)
    .then((data) => {
      res.end(`question ${data.rows[0].id} reported successfully`)
    })
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {

  pool.query(`UPDATE questions set question_helpfulness = question_helpfulness + 1 where questions.id = ${req.params.question_id} returning id`)
    .then((data) => {
      res.end(`question ${data.rows[0].id} helpfulness added`)
    })
})

app.put('/qa/answers/:answer_id/report', (req, res) => {

  pool.query(`UPDATE answers set reported = 1 where answers.id = ${req.params.answer_id} returning id`)
    .then((data) => {
      res.end(`answer ${data.rows[0].id} reported successfully`)
    })
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {

  pool.query(`UPDATE answers set helpfulness = helpfulness + 1 where answers.id = ${req.params.answer_id} returning id`)
    .then((data) => {
      res.end(`answer ${data.rows[0].id} helpfulness added`)
    })
})

app.listen(PORT);
console.log(`Server listening at ${PORT}`);
