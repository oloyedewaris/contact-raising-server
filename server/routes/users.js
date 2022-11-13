const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.fetchUsers = (req, res) => {
  User.find()
    .then(users => res.status(200).json({ users }))
    .catch(err => res.status(500).json({ success: false, msg: "Failed, internal server error", err }))
}

exports.findUser = (req, res) => {
  User.findById(req.params.id)
    .then(user => res.status(200).json({ user }))
    .catch(err => res.status(500).json({ success: false, msg: "Failed, internal server error", err }))
}

// login function
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // backend Validations
  if (!email || !password)
    return res.status(400).json({ msg: "Please enter all fields" });

  //Check for existing user
  User.findOne({ email })
    .then(user => {
      if (!user) return res.status(400).json({ msg: "email not found" });
      //Compare user's password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

        //Sign a jwt token
        jwt.sign(
          { id: user._id }, "secrete", { expiresIn: (60 * 60 * 24 * 365) },
          (err, token) => {
            if (err) throw err;
            return res.status(200).json({ token, user });
          });
      });
    })
    .catch(err => res.status(500).json({ success: false, msg: "Failed, internal server error", err }))
};

// register function
exports.registerUser = (req, res) => {
  const { image, name, email, password } = req.body;

  //Converting javascript date to human understandable
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  const date = `${weeks[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;

  // backend validation
  if (!image || !name || !email || !password)
    return res.status(400).json({msg: "Please enter all fields"});
  if (password.length < 6)
    return res.status(400).json({msg: "Password should be up to six characters"});

  //Check for existing user
  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json({msg: "Email already exist"});

    //Create a new user
    const newUser = new User({
      name,
      email,
      image,
      password,
      registeredAt: date,
      timestamp: Date.now()
    });

    //Hash the user's password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save()
          .then(user => {
            jwt.sign(
              { id: user._id }, "secrete", { expiresIn: (60 * 60 * 24 * 365) },
              (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user })
              }
            );
          })
          .catch(err => res.status(500).json({ msg: "Failed, internal server error", err }));
      });
    });
  }).catch(err => res.status(500).json({ msg: "Failed, internal server error", err }));
};

// update function
exports.updateUser = (req, res) => {
  const { locationData } = req.body;

  // backend Validations
  if (!locationData)
    return res.status(400).json({msg: "Please enter all fields"});

  //Check for existing user
  User.findByIdAndUpdate(
    req.user._id,
    { $push: { locationData } },
    { new: true, upsert: true },
    (err, user) => {
      if (err) return res.status(400).json({ err, msg: 'an error occured' })
      return res.status(200).json({ user });
    }
  )
};