const http = require('http');

const server = http.createServer((request,response) => {
    response.end("Hello");
});

server.listen(3000, () => {
    console.log("Server running on port 3000")
});