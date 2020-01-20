const {db, admin} = require('../util/admin');
const constantTypes = require('../constants');

const firebaseConfig = require('../util/firebaseConfig');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const {
  validateSignUpData,
  validateLoginData,
  reduceUserDetails,
} = require('../util/validators');

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {valid, errors} = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

  const noImage = 'no-image.png';

  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({handle: 'this handle already exists'});
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImage}?alt=media`,
        userId,
      };
      db.doc(`users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({token});
    })
    .catch(err => {
      console.error(err);
      if (err.code === constantTypes.PASSWORD_ERROR) {
        return res.status(400).json({email: 'email already in use'});
      } else {
        return res.status(500).json({error: err.code});
      }
    });
};

exports.login = (req, res) => {
  const logInUser = {
    email: req.body.email,
    password: req.body.password,
  };
  const {valid, errors} = validateLoginData(logInUser);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(logInUser.email, logInUser.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({token});
    })
    .catch(err => {
      console.error(err.code);
      if (err.code === constantTypes.PASSWORD_ERROR) {
        return res.status(403).json({error: 'Wrong password credentials'});
      } else return res.status(500).json({error: err.code});
    });
};

//Add user details
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({message: 'Details are added successfully'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};

// Upload a profile image for the user
exports.uploadImage = (req, res) => {
  const Busboy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new Busboy({headers: req.headers});
  let imageFileName;
  let imageFileToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    //777872738788.png
    imageFileName = `${Math.round(
      Math.random() * 100000000000,
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageFileToBeUploaded = {filepath, mimetype};
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageFileToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageFileToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.handle}`).update({imageUrl});
      })
      .then(() => {
        return res.json({message: 'Image uploaded Succesfully'});
      })
      .catch(err => {
        console.error(err, 'is this the error ');
        return res.status(500).json({error: err.code});
      });
  });
  busboy.end(req.rawBody);
};

//Get own users Details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('likes')
          .where('userHandle', '==', req.user.handle)
          .get();
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};
