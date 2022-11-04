const path = require("dotenv")
const { Pool, client } = require('pg')
const PORT = 3000;
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT
})

app.get('/qa/questions?:product_id', (req, res) => {
  pool.query(`select
json_build_object(
  'results', json_agg(
    json_build_object(
      'question_id', q.id,
      'question_body', q.question_body,
      'question_date', q.date_written,
      'asker_name', q.asker_name,
      'asker_email', q.asker_email,
      'reported', q.reported,
      'question_helpfulness', q.question_helpfulness,
      'answers', answer
    )
  )
) results
from questions q
left join (
select
  question_id,
  json_object_agg(
    a.id,
    json_build_object(
      'id', a.id,
      'body', a.answer_body,
      'date', a.date_written,
      'answerer_name', a.answerer_name,
      'answerer_email', a.answerer_email,
      'reported', a.reported,
      'helpfulness', a.helpfulness,
      'photos', photo
      )
      ) answer
from answers a
  left join (
    select
      answer_id,
      json_agg(
        json_build_object(
          'id', ap.id,
          'url', ap.url
        )
      ) photo
    from answers_photos ap
    group by 1
  ) ap on a.id = ap.answer_id
  group by question_id
) a on q.id = a.question_id
where q.product_id = ${req.query.product_id}
`)
    .then((data) => {
      var results = data.rows[0].results.results
      var productId = req.query.product_id
      res.end(JSON.stringify({ productId, results }))
    })
})

app.get('/qa/questions/:question_id/answers', (req, res) => {

  pool.query(`select
  json_build_object(
    'results', json_agg(
      json_build_object(
        'answer_id', a.id,
        'body', a.answer_body,
        'date', a.date_written,
        'answerer_name', a.answerer_name,
        'answerer_email', a.answerer_email,
        'reported', a.reported,
        'helpfulness', a.helpfulness,
        'photos', photo
        )
        )
  ) results
from answers a
left join (
      select
        answer_id,
        json_agg(
          json_build_object(
            'id', ap.id,
            'url', ap.url
          )
        ) photo
      from answers_photos ap
      group by 1
    ) ap on a.id = ap.answer_id
    where a.question_id = ${req.params.question_id}`)
    .then((data) => {
      var results = data.rows[0].results
      var question = req.params.question_id
      res.end(JSON.stringify({ question, results }))
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
