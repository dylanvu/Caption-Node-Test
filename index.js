import express from "express";
import http from 'http';
const app = express();
const port = 5001;

const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api', (req, res) => {
    console.log(req);
    res.send('POST request to the homepage')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});