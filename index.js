



app.get('qa/questions/', (req, res) => {
  findQuestions(res.data.id)
  .then((data) => {
    res.writeHead(200, headers)
    res.end(data)
  })
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