const router = require("express").Router();
const User = require("../models/User.model.js")
const bcrypt = require('bcryptjs');


router.get('/signup', (req,res,next)=>{
res.render('auth/signup.hbs')
})
 
router.post('/signup', async (req,res,next)=>{
const {username,password}= req.body

//el usuario no ha llenado alguno de los campos
  if (username === "" || password === "") {
    res.render("auth/signup.hbs", {
      errorMessage: "No olvides rellenar todos los campos! :)"
    })
    return; 
  }
  // dificultad contraseña
  let passwordHard = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/
  if (passwordHard.test(password) === false) {
    res.render("auth/signup.hbs", {
      errorMessage: "Currate un poco más la contraseña. (Mínimo, mayúscula, minúscula, número y caracter especial. Y más de 8 caracteres de largo so vago)"
    })
    return; 
  }
  try{
    // no repetir usuarios
    const foundUserByUsername = await User.findOne({ username })
    if (foundUserByUsername !== null) {
      res.render("auth/signup.hbs", {
        errorMessage: "Ese nombre ya está siendo usado!!!"
      })
      return; 
    } 
    // cifrado de contraseña
    const salt = await bcrypt.genSalt(10)
    const cryptedPassword = await bcrypt.hash(password, salt)
    // crear user
    await User.create({
        username,
        password: cryptedPassword
      })
  
      res.redirect("/auth/login")
  }catch(err) {
    next(err)
  }
}) 


//get login de usuario
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs")
})

// POST login de usuario
router.post("/login", async (req, res, next) => {
  const { user, password } = req.body

  // datos !== vacios
  if (user === "" || password === "") {
    res.render("auth/login.hbs", {
      errorMessage: "Rellénalo hombre!"
    })
    return;
  }


  try {
    // usuario? estás ahí?
    const foundUser = await User.findOne({username: user}) //si falla revisar
    if (foundUser === null) {
      res.render("auth/login.hbs", {
        errorMessage: "Aquí no te has registrado aún."
      })
      return;
    }
  
    // contraseña === ok
    const isPasswordValid = await bcrypt.compare(password, foundUser.password)
    console.log("isPasswordValid", isPasswordValid)
    if (isPasswordValid === false) {
      res.render("auth/login.hbs", {
        errorMessage: "Se te ha olvidado la contraseña?"
      })
      return;
    }
    //sesion de cookie+sesiondb
    req.session.user = {
      _id: foundUser._id,
      username: foundUser.username,
    }
    req.session.save(() => {
      res.redirect("/profile") 
    })
  } catch (err) {
    next(err)
  }

})



module.exports = router