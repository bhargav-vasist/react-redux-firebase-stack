const functions = require('firebase-functions');

const firebaseConfig = {
    apiKey: "AIzaSyDwJJX0qaLg9sHSzLPFF4TKsbUK5L_c1VA",
    authDomain: "unsocial-alien.firebaseapp.com",
    databaseURL: "https://unsocial-alien.firebaseio.com",
    projectId: "unsocial-alien",
    storageBucket: "unsocial-alien.appspot.com",
    messagingSenderId: "362380376412",
    appId: "1:362380376412:web:0a6ecea50d564d6710e999",
    measurementId: "G-P8DX3K4MRV"
};

const admin = require('firebase-admin')
admin.initializeApp()

const express = require('express')
const app = express()

const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)


app.get('/posts', (req, res) => {
    admin.firestore().collection('alien-posts').get()
        .then(data => {
            let posts = [];
            data.forEach(doc => {
                posts.push({
                    postId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                })
            })
            return res.json(posts)
        })
        .catch(err => {
            console.error(err)
        })
})

app.post('/post', (req, res) => {
    const newPost = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }
    admin
        .firestore()
        .collection('alien-posts')
        .add(newPost)
        .then(doc => {
            res.json(`this ${doc.id} is succesfull`)
        })
        .catch(err => {
            res.status(500).json({error: 'server not working'})
        })
})

app.post('/signUp', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            return res.status(201).json({message: `user ${data.user.uid} successfully created`})
        })
        .catch(err => {
            return res.status(500).json({error:'internal error'})
        })
})


exports.api = functions.https.onRequest(app)