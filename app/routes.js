module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    app.get('/thanks', function(req, res) {
      res.render('thanks.ejs');
  });   

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('saveForLater').find().toArray((err, saveForLater) => {
          if (err) return console.log(err)
          db.collection('shoppingCart').find().toArray((err, shoppingCart) =>{
            if (err) return console.log(err)
            console.log(`render profile ${saveForLater.length}:${shoppingCart.length}`)
            res.render('profile.ejs', {
              user : req.user,
              save: saveForLater,
              cart: shoppingCart
  
            })
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

    app.get('/shoppingCart', function(req, res) {
      db.collection('shoppingCart').find().toArray((err, shoppingCart) =>{
        if (err) return console.log(err)
        let totalAmount = 0
        shoppingCart.forEach(element => {
          totalAmount += parseFloat(element.price)
        })
        res.render('shoppingCart.ejs', {
          user : req.user,
          cart: shoppingCart,
          total: totalAmount

        })
      })
    })


// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('saveForLater').insertOne({name: req.body.name, price: req.body.price}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

    app.put('/messages', (req, res) => {
      db.collection('shoppingCart')
      .findOneAndUpdate({name: req.body.name, price: req.body.price}, {
        $push: {
          cart: `$${req.body.name} ${req.body.msg}`
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

  
    app.delete('/messages', (req, res) => {
      db.collection('saveForLater').findOneAndDelete({name: req.body.name, price: req.body.price}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

    app.delete('/deleteCartItem', (req, res) => {
      db.collection('shoppingCart').findOneAndDelete({name: req.body.name, price: req.body.price}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
