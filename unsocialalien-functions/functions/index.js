const functions = require('firebase-functions');

const admin = require('firebase-admin')
admin.initializeApp()

const express = require('express')
const app = express()


app.get('/posts',(req,res)=>{
    admin.firestore().collection('alien-posts').get()
        .then(data => {
            let posts = [];
            data.forEach(doc => {
                posts.push({
                    postId: doc.id,
                    body:doc.data().body,
                    userHandle:doc.data().userHandle,
                    createdAt : doc.data().createdAt
                })
            })
            return res.json(posts)
        })
        .catch(err => {
            console.error(err)
        })
})

app.post('/post',(req,res)=>{
    const newPost = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    }
    admin
        .firestore()
        .collection('alien-posts')
        .add(newPost)
        .then(doc =>{
            res.json(`this ${doc.id} is succesfull`)
        })
        .catch(err =>{
            res.status(500).json({error: 'server not working'})
        })
})


exports.api = functions.https.onRequest(app)