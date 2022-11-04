const PORT =  3000;
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/qa/question?:product_id', (req, res) => {
  req.query.product_id
})

app.get('qa/answers', (req, res) => {
  findAnswers(res.data.id)
  .then((data) => {
    res.writeHead(200, headers)
    res.end(data)
  })
})

app.post('qa/answers/', (req, res) => {
  var answer = req.body.data
  addAnswer({answer})
  .then((data) => {
    res.writeHead(200, headers)
    res.end(data)
  })
})

app.post('qa/questions/', (req, res) => {
  var question = req.body.data
  addQuestion({question})
  .then((data) => {
    res.writeHead(200, headers)
    res.end(data)
  })
})


app.listen(PORT);
console.log(`Server listening at ${PORT}`);