const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

const GetTranslations = require('./get-translations');
const Convert = require('./convert');
const Add = require('./add');
const Edit = require('./edit');

app.post('/get-translations', GetTranslations);

app.post('/convert', Convert);

app.post('/add', Add);

app.post('/edit', Edit);

app.listen(3000, () => {
  console.log('SERVER LISTENING AT http://localhost:4000');
});
