const constantTypes = require('./constants');
const functions = require('firebase-functions');

const express = require('express');
const app = express();

const FbAuth = require('./util/fbAuth');

const {getAllPosts, postSinglePost} = require('./handlers/posts');
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require('./handlers/users');

//Post Routes
console.log(getAllPosts);
app.get('/posts', getAllPosts);
app.post('/post', FbAuth, postSinglePost);

//User Routes
app.post('/signUp', signUp);
app.post(`/login`, login);
app.post('/user/image', FbAuth, uploadImage);
app.post('/user', FbAuth, addUserDetails);
app.get('/user', FbAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
