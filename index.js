import express from "express";
const app = express();
const port = 5001;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api', (req, res) => {
    console.log(req);
    res.send('POST request to the homepage')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});