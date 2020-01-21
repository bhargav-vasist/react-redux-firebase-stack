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
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  };
  db.collection('alien-posts')
    .add(newPost)
    .then(doc => {
      res.json(`this ${doc.id} is succesfull`);
    })
    .catch(err => {
      res.status(500).json({error: 'server not working'});
    });
};

exports.getPost = (req, res) => {
  let postData = {};
  db.doc(`/alien-posts/${req.params.postId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'post not found'});
      }
      postData = doc.data();
      postData.postId = doc.id;
      return db
        .collection('comments')
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
