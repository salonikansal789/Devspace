// const express = require('express');
// const router = express.Router();

// const userController = require('./controller/userController');

// router.get('/', (req, res)=>{
//     res.render('home-guest')
// })

// // router.get('/register', userController.register)

// router.post('/register', userController.register)

// module.exports = router;
const express=require('express');
const router=express.Router();
const userController = require('./controller/userController');
const postController=require('./controller/postController');
const followController=require('./controller/followController');
const isAuth=require('./middleware/isauth')


router.get('/', userController.home)
// router.get('/', (req, res) => {
//     res.render('userController.home', {
//       flash: req.flash('error')
//     });
//   });

router.post('/register',userController.register)
router.post('/login',userController.login);
router.post('/logout',userController.logout);
// router.get('/profile/:username',userController.ifUserExists,userController.profilePostScreen)
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostScreen);
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowerScreen);
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen);


router.get('/create-post',isAuth.isAuthenticated,postController.viewCreatePage)
router.post('/create-post',isAuth.isAuthenticated,postController.createPost)
router.get('/post/:id',postController.viewSingle)
router.get('/post/:id/edit',isAuth.isAuthenticated,postController.viewEditScreen)
router.post('/post/:id/edit',isAuth.isAuthenticated,postController.edit)
router.post('/post/:id/delete', isAuth.isAuthenticated, postController.delete)
router.post('/search',postController.search)

router.post('/addFollow/:username', isAuth.isAuthenticated, followController.addFollow)
router.post('/removeFollow/:username', isAuth.isAuthenticated, followController.removeFollow)


router.get('/register',(req,res)=>{
    res.send("registered!!");

})

module.exports=router;