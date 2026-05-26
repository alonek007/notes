require('dotenv').config()
const crypto = require('crypto')
global.crypto = crypto.webcrypto
const express = require('express')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.JWT_SECRET
const app = express() 
const bcrypt = require('bcrypt');
const cors = require('cors')


app.use(cors())
app.use(express.json())

//mongo db connection 
mongoose.connect(process.env.MONGO_URL)
.then(function(){
    console.log("mongodb conncted ")
    app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});



})
.catch(function(err){
    console.log("moogo err", err);
})


//schema 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
})

const User = mongoose.model('user', userSchema);


    app.get('/', (req, res) => {
  res.send('Hello World!');
});




app.post('/signup', async function (req, res){
    const { name, email, password } = req.body

    const eU = await User.findOne({ email })

    if (eU) {
        return res.json({
            message: "user already exists"})
    }

    const hP = await bcrypt.hash(password, 10)

    const newUser = new User({
        name,
        email,
        password: hP
    })

    await newUser.save()

    res.json({
    message: "User created"
})
})


app.post('/login', async function(req, res) {
    const {email, password} = req.body
    const e = await User.findOne({email})
    if(!e) {
        return res.send("user not found")
    }

    const hp = await bcrypt.compare(password, e.password)
    if (!hp) {
        return res.send("cant login")
    }
    else {

const payload = {
        userId: e._id
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

    return res.send({ message: "login successful", token })
}
})



//middleware for auth
function auth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token){
        return res.send("no token provided")
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }
    catch(err) {
        return res.send("invalid token")
    }
    }

app.get('/profile', auth, async function (req,res) {
    const user = await User.findById(req.user.userId)

    res.send(user)
})


const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true 
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
},

    {timestamp: true})

const Note = mongoose.model('note', noteSchema)



app.post('/notes', auth, async function(req,res){
    const {title, content} = req.body
    const newNote = new Note({
        title,
        content,
        user:req.user.userId
    })
    await newNote.save()
      res.json({
        message: "note created",
        note: newNote
      })

})

app.get('/notes', async function(req,res){
    const notes = await Note.find({
        user: req.user.userId
    })
    res.send(notes)
})
