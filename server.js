// require
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bodyParser = require('body-parser');
const PORT = 9001;

const app = express();

mongoose.connect('mongodb://localhost/mySecondDB', { useNewUrlParser: true, useUnifiedTopology: true })

let authorSchema = new Schema({
    name: String,
    desc: String,
    books: [{type: Schema.Types.ObjectId, ref: 'Book'}]
})

let Author = mongoose.model('Author', authorSchema);

let bookSchema = new Schema({
    title: String,
    desc: String,
    author: {type: Schema.Types.ObjectId, ref: 'Author'}
})

let Book = mongoose.model('Book', bookSchema);



// config
app.use(express.static(path.join(__dirname, '/static')))
app.use(bodyParser.urlencoded({extended: true}));

// views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));


// routes
app.get('/', (req, res) => {
    Author.find().populate('books').exec()
        .then(authors => {
            res.render('index', {authors: authors});
        })
        .catch(errors => {
            console.log("Had errors find authors:", errors);
            res.redirect('/');
        })
})

app.post('/author', function(req, res){
    Author.create(req.body)
        .then(author => {
            console.log("Newly created author: ", author);
            res.redirect('/');
        })
        .catch(errors => {
            console.log("Had errors creating authors:", errors);
            res.redirect('/');
        })
})

app.post('/book/:id', function(req, res){
    console.log(req.params.id);
    Author.findOne({'_id': req.params.id})
        .then(foundAuthor => {
            console.log(req.body);
            let newBook = new Book(req.body);
            newBook.author = foundAuthor._id; // <<-- MUST be ._id and not the entire foundAuthor object
            foundAuthor.books.push(newBook);
            console.log(newBook);
            console.log(foundAuthor);
            foundAuthor.save()
                .then(data => {
                    console.log(data);
                    newBook.save()
                        .then(data => {
                            res.redirect('/');
                        })
                        .catch(err => {
                            console.log(err);
                            res.end();
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.end();
                })
        })
        .catch(err => {
            console.log(err);
            res.end();
        })
})

app.post('/author/delete/:id', function(req, res){
    Author.remove({_id: req.params.id})
        .then(data => res.redirect('/'))
        .catch(err => {
            console.log(err);
            res.redirect('/');
        })
})



// listen
app.listen(PORT, function(){
    console.log(`My first express on port ${PORT}`);
})