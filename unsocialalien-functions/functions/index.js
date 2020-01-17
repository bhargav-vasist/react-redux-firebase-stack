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

const db = admin.firestore()

/*const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)*/


app.get('/posts', (req, res) => {
    db
        .collection('alien-posts').get()
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
    db
        .collection('alien-posts')
        .add(newPost)
        .then(doc => {
            res.json(`this ${doc.id} is succesfull`)
        })
        .catch(err => {
            res.status(500).json({error: 'server not working'})
        })
})

const xisEmpty = (string) => {
    if(string.trim() === '') {
        return true
    }else return false
}
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)){
        return true
    }else return false

}



app.post('/signUp', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    let errors = {}
    if(isEmpty(newUser.email)){
        errors.email = 'Field must not be empty '
    }else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(newUser.password)) errors.password = 'Field must not be empty'
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Must match password'
    if(isEmpty(newUser.handle)) errors.handle = 'Field must not be empty'

    if(Object.keys(errors).length > 0) {
        res.status(400).json(errors)
    }

    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({handle: 'this handle already exists'})
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid
            return data.user.getIdToken()
        })
        .then((idToken) => {
            token = idToken
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            }
            db.doc(`users/${newUser.handle}`).set(userCredentials)
        })
        .then(() => {
            return res.status(201).json({token})
        })
        .catch((err) => {
            console.log(err)
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({email: 'email already in use'})
            } else {
                return res.status(500).json({error: err.code})
            }
        })

})

app.post(`/logIn`,(req,res) =>{
    const logInUser = {
        email : req.body.email,
        password: req.body.password
    }
    let errors ={}

    if(isEmpty(logInUser.email)) return errors.email =  'Field must not be empty '
    if(isEmpty(logInUser.password)) return errors.password =  'Field must not be empty '

    if(Object.keys(errors).length > 0) return res.status(400).json(errors)
    firebase.auth().signInWithEmailAndPassword(logInUser.email, logInUser.password)
        .then(data =>{
            return data.user.getIdToken()
        })
        .then(token =>{
            return res.json({token})
        })
        .catch(err =>{
            console.log(err.code)
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({error : 'Wrong password credentials' })
            }else return res.status(500).json({error :err.code})
        })

})

exports.api = functions.https.onRequest(app)