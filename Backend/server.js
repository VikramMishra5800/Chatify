const express = require("express");
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const userRoutes = require("./Router/userRoutes")
const chatRoutes = require("./Router/chatRoutes");
const messageRoutes = require("./Router/messageRoutes");
const path = require("path");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("./models/userModels");
const session = require('express-session');
const cors = require("cors");
const generateToken = require("./config/generateToken");

dotenv.config({path:".env"});
connectDB();

const app = express();

//used to tell the server or express too accept json data from frontend
app.use(express.json());

app.use(cors({
  origin : "http://localhost:3000",
  methods : "Get,Post,Put,Delete",
  credentials : true
  })

);

//passport strategy
passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
      done(err, user);
  });
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))


// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());


//Google Strategy for Authentication
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "/auth/google/chats"
},
async function(accessToken, refreshToken, profile, cb) {
  // console.log(profile);
  try {
    // Check if the user with the Google ID already exists in the database
    let user = await User.findOne({
      $or: [
      { googleId: profile.id },
      { email: profile.emails[0].value }
  ]});

    if (!user) {
        // If the user doesn't exist, create a new user and populate it with data from the Google profile
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            pic: profile.photos[0].value,
        });
        await user.save();
    }

    return cb(null, user);
} catch (err) {
    return cb(err, null);
}
}
));


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/chats', 
  passport.authenticate('google',{ failureRedirect: `${process.env.REACT_APP_Website_URL}` }),
  function(req, res) {
    console.log(process.env.Website_URL);
    res.redirect(`${process.env.REACT_APP_Website_URL}`);
  });


app.get("/auth/login/success", (req, res) => {
    if (req.user) {
      res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        pic: req.user.pic,
        token: generateToken(req.user._id)
      });
    } else {
      res.status(403).json({ error: true, message: "Not Authorized" });
    }
  });

app.get("/auth/logout",(req,res)=>{
  req.session.destroy(err=>{
    if(err){
      console.log(err);
    }

    res.redirect(`${process.env.REACT_APP_Website_URL}`);
  })
})

app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);

// --------------------------deployment------------------------------

//path.resolve() will give the absolute path of working directory
//In this case working directory is /Web Chat/, because remember in backend we are starting the server.js in this directory
const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,console.log(`Server is running at PORT ${PORT}`));

//socket initialisation
const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors:{
        origin: "http://localhost:3000"
    }
})


/*Another method of socket initialisation
  // Require the socket.io module and assign it to a variable
const socketio = require("socket.io");

// Define the options object for socket.io
const options = {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000"
  }
};

// Create a socket.io instance by passing the server object and the options object
const io = socketio(server, options);

*/ 
//--------------------------------

io.on("connection",(socket) => {
    console.log("connected to socket.io");

    // socket for user personal room
    socket.on("setup",(userData)=>{
        socket.join(userData._id);
        socket.emit("connected");
    })

    // another socket to create a room when any user clicks on any chat
    socket.on("join chat",(room)=>{
        socket.join(room);  
    })
 
    socket.on("typing",(room)=> socket.in(room).emit("typing"));
    socket.on("stop typing",(room)=> socket.in(room).emit("stop typing"));

    socket.on("new message",(newMessageReceived)=>{
        var chat = newMessageReceived.chat;

        if(!chat.users)
        return console.log("chat.users not defined");

        chat.users.forEach((user)=>{
            if(user._id === newMessageReceived.sender._id)
            return;

            //otherwise we are emitting/sending newMessages to the current user room
            socket.in(user._id).emit("message received",newMessageReceived);
        })
     })

    socket.off("setup", ()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    })
})