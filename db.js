const path = require("dotenv")
const { Pool, client } = require('pg')

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT
})

// -------------- gets questions w array of answers -------------------------
// SELECT q.*, json_agg(a.*) as answers
// FROM questions q
// LEFT JOIN answers a
// ON q.id=a.question_id
// GROUP BY q.id

// -------------- gets answer w array of photos -------------------------
// SELECT az.*, json_agg(json_build_object('id', ap.id, 'url', ap.url)) as photos
// FROM answers az
// LEFT JOIN answers_photos ap
// ON ap.answer_id = az.id
// GROUP BY az.id
// ORDER BY az.question_id
function findQuestions(id) {
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
where q.id = ${id}
`)
    .then((res) => {
      var results = res.rows[0].results.results
      var productId = id
      console.log('questions', { productId, results })
      pool.end()
    })
}


function findAnswers(id) {
  pool.query(`select
  json_build_object(
    'results', json_agg(
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
    .then((res) => {
      var results = res.rows[0].results.results
      var question = id
      console.log('answers', { question, results })
      pool.end()
    })
}
function addQuestion(body, name, email, productId) {
  pool.query(`insert into questions(question_body, date_written, asker_name, asker_email, product_id, reported, question_helpfulness)
  values('${body}', '${Date.now()}', '${name}', '${email}', '${productId}', '0', '0') RETURNING id`)
  .then((res) => {
    console.log('question added successfully', res.rows[0].id)
    pool.end()
  })
}

function addAnswer(qId, body, name, email, photos) {
  pool.query(`insert into answers(question_id, answer_body, date_written, answerer_name, answerer_email, reported, helpfulness) values ('${qId}', '${body}', '${Date.now()}', '${name}', '${email}', '0', '0') RETURNING id`)
  .then((res) => {
    photos.forEach((url) => {
      pool.query(`insert into answers_photos(answer_id, url) values ('${res.rows[0].id}', '${url}')`)
    })
  })
  .then((res) => {
    console.log('answer added successfully')
    pool.end()
  })

}

function questionReport(qId) {
  pool.query(`UPDATE questions set reported = 1 where questions.id = ${qId} returning id`)
  .then((res) => {
    console.log(`question ${res.rows[0].id} reported successfully` )
    pool.end()
  })
}
function questionHelpful(qId) {
  pool.query(`UPDATE questions set question_helpfulness = question_helpfulness + 1 where questions.id = ${qId} returning id`)
  .then((res) => {
    console.log(`question ${res.rows[0].id} helpfulness added` )
    pool.end()
  })
}

function answerReport(aId) {
  pool.query(`UPDATE answers set reported = 1 where answers.id = ${aId} returning id`)
  .then((res) => {
    console.log(`answer ${res.rows[0].id} reported successfully` )
    pool.end()
  })
}
function answerHelpful(aId) {
  pool.query(`UPDATE answers set helpfulness = helpfulness + 1 where answers.id = ${aId} returning id`)
  .then((res) => {
    console.log(`answer ${res.rows[0].id} helpfulness added` )
    pool.end()
  })
}

// addAnswer(3518967, 'test', 'test', 'test@gmail.com', ['test.com', 'test.com'])
// questionReport(3518967)
// questionHelpful(3518967)
// answerReport(5)
// answerHelpful(6879316)
// findQuestions(423423)
findAnswers(23)

module.exports.findQuestions = findQuestions;
module.exports.findQuestions = findAnswers;
module.exports.findQuestions = addAnswer;
module.exports.findQuestions = addQuestion;
