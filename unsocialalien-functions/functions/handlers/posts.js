const {db} = require('../util/admin');

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
