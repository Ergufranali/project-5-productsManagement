const express = require('express');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const multer = require('multer');

const app = express();

mongoose.connect("mongodb+srv://purunaik:purunaik@cluster0.zgxxxk0.mongodb.net/group12Database", {useNewUrlParser: true})
.then(()=> console.log("Connected to database"))
.catch((err)=> console.log(err.message))

app.use(express.json());
app.use(multer().any());

const route = require('./route/route');

app.use('/', route);

app.listen(3000, (err)=>{
    if(err) return console.log(err);
    console.log("Application is running...");
});