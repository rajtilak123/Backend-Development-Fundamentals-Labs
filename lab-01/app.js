const express = require('express');
const app = express()

app.get('/', (request, response) => {
    response.send('Welcome to my Backend Develoment Lab');
});

app.get('/about', (request, response) => {
    response.json({
        name: 'Tilak',
        section: '307'
    })
});

app.get('/time', (request, response) => {
    let date = new Date();
    response.send(date.toString())
});

app.use((request, response) => {
    response.status(404).send('404 -Page Not Found');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});