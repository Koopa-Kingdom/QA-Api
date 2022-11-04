const path = require("dotenv")
const { Pool, client } = require('pg')
const PORT =  3000;
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

app.get('/qa/question?:product_id', (req, res) => {
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
      console.log({ productId, results })
      res.end(JSON.stringify({ productId, results }))
      pool.end()
    })
})

function findAnswers(id) {
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
    where a.question_id = ${id}`)
    .then((data) => {
      var results = data.rows[0].results
      var question = id
      console.log('answers', { question, results })
      pool.end()
    })
}

function addQuestion(body, name, email, productId) {
  pool.query(`insert into questions(question_body, date_written, asker_name, asker_email, product_id, reported, question_helpfulness)
  values('${body}', '${Date.now()}', '${name}', '${email}', '${productId}', '0', '0') RETURNING id`)
    .then((data) => {
      console.log('question added successfully', data.rows[0].id)
      pool.end()
    })
}

function addAnswer(qId, body, name, email, photos) {
  pool.query(`insert into answers(question_id, answer_body, date_written, answerer_name, answerer_email, reported, helpfulness) values ('${qId}', '${body}', '${Date.now()}', '${name}', '${email}', '0', '0') RETURNING id`)
    .then((data) => {
      photos.forEach((url) => {
        pool.query(`insert into answers_photos(answer_id, url) values ('${data.rows[0].id}', '${url}')`)
      })
    })
    .then((data) => {
      console.log('answer added successfully')
      pool.end()
    })
}

function questionReport(qId) {
  pool.query(`UPDATE questions set reported = 1 where questions.id = ${qId} returning id`)
    .then((data) => {
      console.log(`question ${data.rows[0].id} reported successfully`)
      pool.end()
    })
}

function questionHelpful(qId) {
  pool.query(`UPDATE questions set question_helpfulness = question_helpfulness + 1 where questions.id = ${qId} returning id`)
    .then((data) => {
      console.log(`question ${data.rows[0].id} helpfulness added`)
      pool.end()
    })
}

function answerReport(aId) {
  pool.query(`UPDATE answers set reported = 1 where answers.id = ${aId} returning id`)
    .then((data) => {
      console.log(`answer ${data.rows[0].id} reported successfully`)
      pool.end()
    })
}

function answerHelpful(aId) {
  pool.query(`UPDATE answers set helpfulness = helpfulness + 1 where answers.id = ${aId} returning id`)
    .then((data) => {
      console.log(`answer ${data.rows[0].id} helpfulness added`)
      pool.end()
    })
}

// addAnswer(3518967, 'test', 'test', 'test@gmail.com', ['test.com', 'test.com'])
// questionReport(3518967)
// questionHelpful(3518967)
// answerReport(5)
// answerHelpful(6879316)
// findQuestions(1)
// findAnswers(23)

app.listen(PORT);
console.log(`Server listening at ${PORT}`);

// module.exports.findQuestions = findQuestions;
// module.exports.findAnswers = findAnswers;
// module.exports.addAnswer = addAnswer;
// module.exports.addQuestion = addQuestion;
// module.exports.answerHelpful = answerHelpful;
// module.exports.questionHelpful = questionHelpful;
// module.exports.answerReport = answerReport;
// module.exports.questionReport = questionReport;
