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
      var obj = res.rows[0].results.results
      var productId = id
      console.log('questions', { productId, obj })
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
      var obj = res.rows[0].results.results
      var question = id
      console.log('answers', { question, obj })
    })
}
// findQuestions(5)
// findAnswers(5)
// id,product_id,body,date_written,asker_name,asker_email,reported,helpful
function addQuestion(body, name, email, productId) {
  pool.query(`insert into questions(question_body, date_written, asker_name, asker_email, product_id, reported, question_helpfulness)
  values('${body}', '${Date.now()}', '${name}', '${email}', '${productId}', '${0}', '${0}')`)
  .then((res) => {
    console.log('question added successfully')
  })
}

addQuestion('test', 'test', 'test@gmail.com', 1)


module.exports.findQuestions = findQuestions;
