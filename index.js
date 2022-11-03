



app.get('/questions', (req, res) => {
  findQuestions(res.data.id)
  .then((data) => {
    res.writeHead(200, headers)
    res.end(data)
  })
})

app.get('/answers', (req, res) => {
  findAnswers(res.data.id)
  .then((data) => {
    res.writeHead(200, headers)
    res.end(data)
  })
})