const path = require("dotenv")
const { Pool, client } = require('pg')

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT
})

const test = 1
const results = {}
pool.query(`SELECT * FROM questions WHERE questions.product_id = ${test}`)
  .then((res) => {
    res.rows.forEach((item) => {
      results[item.id] = item
    })
    return res.rows
  })
  .then((item) => {
    item.forEach((question) => {
      pool.query(`select * FROM answers where answers.question_id = ${question.id}`)
      .then((answer) => {
        results[question.id].answers = answer.rows
        return answer.rows
      })
      .then((row) => {
        row.forEach((rowItem) => {
          pool.query(`select * FROM answers_photos where answers_photos.answer_id = ${rowItem.id}`)
          .then((photo) => {
            for (let key in results) {
              if (results[key].answers && photo.rows) {
                console.log(photo.rows)
                console.log(results[key].answers)
                results[key].answers.forEach((answer) => {
                    photo.rows.forEach((row) => {
                    if (row.answer_id === answer.id) {
                      answer.photo = photo.rows
                      // console.log('row-id', row.answer_id)
                      // console.log('answer-id', answer.id)
                      // console.log('photo row', photo.rows)
                      // console.log('answer ', answer)
                    }
                  })
                })
              }
            }
          })
        })
      })
      .then(() => {
        // console.log(results[5].answers)
      })
    })
  })

