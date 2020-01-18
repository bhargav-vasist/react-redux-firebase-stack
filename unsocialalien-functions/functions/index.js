const constantTypes = require('./constants');
const functions = require('firebase-functions');

const express = require('express');
const app = express();

const FbAuth = require('./util/fbAuth');

const {getAllPosts, postOnePost} = require('./handlers/posts');
const {signUp, login, uploadImage} = require('./handlers/users');

//Post Routes
console.log(getAllPosts);
app.get('/posts', getAllPosts);
app.post('/post', FbAuth, postOnePost);

//User Routes
app.post('/signUp', signUp);
app.post(`/logIn`, login);
app.post(`/user/upload`, uploadImage);

exports.api = functions.https.onRequest(app);
