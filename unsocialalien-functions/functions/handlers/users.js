const {db} = require('../util/admin');

const firebaseConfig = require('../util/firebaseConfig');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const {validateSignUpData, validateLoginData} = require('../util/validators');

exports.signUp = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {valid, errors} = validateSignUpData(newUser);
  if (!valid) return res.status(400).json(errors);

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
        userId,
      };
      db.doc(`users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({token});
    })
    .catch(err => {
      console.log(err);
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
      console.log(err.code);
      if (err.code === constantTypes.PASSWORD_ERROR) {
        return res.status(403).json({error: 'Wrong password credentials'});
      } else return res.status(500).json({error: err.code});
    });
};
