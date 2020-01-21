const {db, admin} = require('../util/admin');

exports.getAllPosts = (req, res) => {
  db.collection('alien-posts')
    .get()
    .then(data => {
      let posts = [];
      data.forEach(doc => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(posts);
    })
    .catch(err => {
      console.error(err);
    });
};

exports.postSinglePost = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'Body shouldnt be empty'});
  }
  const newPost = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    likeCount: 0,
    commentCount: 0,
  };
  db.collection('alien-posts')
    .add(newPost)
    .then(doc => {
      const resPost = newPost; // assigning?
      resPost.postId = doc.id;
      res.json(resPost);
    })
    .catch(err => {
      res.status(500).json({error: 'server not working'});
    });
};
//get single post
exports.getPost = (req, res) => {
  let postData = {};
  db.doc(`/alien-posts/${req.params.postId}`) //are params and body same?
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'post not found'});
      }
      postData = doc.data(); //data transfer?
      postData.postId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('postId', '==', req.params.postId)
        .get();
    })
    .then(data => {
      postData.comments = [];
      data.forEach(doc => {
        postData.comments.push(doc.data());
      });
      return res.json(postData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};
//post comment on a post
exports.commentOnPost = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({error: 'this should not be empty'});
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };
  db.doc(`/alien-posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'post not found'});
      }
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      return res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({error: err.code});
    });
};

//like a post
exports.likePost = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('postId', '==', req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/alien-posts/${req.params.postId}`);

  let postData;
  postDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({error: 'Post not found'});
      }
    })
    .then(data => {
      if (data.empty) {
        return db
          .collection('likes')
          .add({
            postId: req.params.postId,
            userHandle: req.user.handle,
          })
          .then(() => {
            postData.likeCount++;
            return postDocument.update({likeCount: postData.likeCount});
          })
          .then(() => {
            return res.json(postData);
          });
      } else {
        return res.status(404).json({error: 'this post is already liked'});
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};

// unlike a post
exports.unlikePost = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('postId', '==', req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/alien-posts/${req.params.postId}`);

  let postData;
  postDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({error: 'Post not found'});
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(404).json({error: 'this post is not liked'});
      } else {
        return db
          .doc(`/likes/${data.docs[0].data().id}`)
          .delete()
          .then(() => {
            postData.likeCount--;
            return postDocument.update({likeCount: postData.likeCount});
          })
          .then(() => {
            res.json(postData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};
