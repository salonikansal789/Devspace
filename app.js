const express=require('express');
const session=require('express-session');
const flash=require('connect-flash');
const MongoDBStore = require('connect-mongodb-session')(session);
const app=express();
const { connection} = require("./db");
// const RegisterCollection=require("./models/registers");
const router=require('./router');

const store = new MongoDBStore({
    uri: 'mongodb+srv://root:shivam-pathak@cluster0.xp52uye.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions',
    expires: 2 * 24 * 60 * 60 * 1000
  });
  
  store.on('error', (error) => {
    console.log(error);
  });

let sessionOptions=session({
    secret:"JS is cool",
    store:store,
    resave:false,
    saveUninitialized:false,
    cookie: { maxAge: 2 * 24 * 60 * 60 * 1000 }
    // cookie:{maxAge:1000*600,httpOnly:true}
})
app.use(sessionOptions)
app.use(flash());
app.use(function(req,res,next){
    res.locals.errors=req.flash("errors");
    res.locals.success=req.flash("success");
    if(req.session.user){
        req.visitorId=req.session.user._id
    }
    else{
        req.visitorId=0
    }
    res.locals.user=req.session.user
    next()
})
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.set('view engine', 'ejs');
app.use('/',router)

const server = require('http').createServer(app)

const io = require('socket.io')(server)

// make expression session data availble from socket
io.use(function(socket, next){
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', (socket)=>{
    console.log("new user connected")
    if(socket.request.session.user){
        let user = socket.request.session.user

        socket.emit('welcome', {username: user.username, avatar: user.avatar})

        socket.on('chatMessageFromBrowser', function(data){
            socket.broadcast.emit('chatMessageFromServer', {message: data.message, username: user.username, avatar: user.avatar})
        })
    }
})

    server.listen(process.env.PORT,()=>{
        console.log("server connecting");
    })
     
    connection();
module.exports=server;