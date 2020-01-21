const constantTypes = require('./constants');
const functions = require('firebase-functions');

const express = require('express');
const app = express();

const FbAuth = require('./util/fbAuth');

const {
  getAllPosts,
  postSinglePost,
  getPost,
  commentOnPost,
  likePost,
  unlikePost,
} = require('./handlers/posts');
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
app.get('/post/:postId', getPost);
app.post('/post/:postId/comment', FbAuth, commentOnPost);
app.post('/post/:postId/like', FbAuth, likePost);
app.post('/post/:postId/unlike', FbAuth, unlikePost);

//User Routes
app.post('/signup', signUp);
app.post(`/login`, login);
app.post('/user/image', FbAuth, uploadImage);
app.post('/user', FbAuth, addUserDetails);
app.get('/user', FbAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
