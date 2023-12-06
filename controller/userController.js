// const User = require('../models/User')

// exports.register = (req, res)=>{
//     console.log(req.body)
//     let user = new User(req.body)
//     user.register().then(()=>{
//         res.send("registered successfully!!!")
//     }).catch(err =>{
//         console.log(err)
//         res.send("error!!!")
//     })
// }
const bcrypt = require('bcryptjs')
const User = require('../models/register')
const Post = require('../models/Post')
const Follow = require('../models/Follow');
const md5=require('md5');



exports.sharedProfileData = async function(req, res, next) {
  console.log("hi visitor");
  try {
    const loginUserId = req.visitorId; // ID of the logged-in user
    const username = req.params.username; // Username of the profile user

    const followerId = req.visitorId; // ID of the user who wants to unfollow
    const authorUsername = req.params.username; // Username of the user being unfollowed

    // Find the follower user
    // const follower = await User.findById(followerId);
   
    // Find the author user
    const author = await User.findOne({ username: authorUsername });



    // Find the login user and profile user by their IDs
    const [loginUser, profileUser] = await Promise.all([
      User.findById(loginUserId),
      User.findOne({ username })
    ]);

    // Check if the visitor is viewing their own profile
    const isOwnProfile = loginUserId && loginUserId.toString() === profileUser._id.toString();

    let followStatus = "Follow";

    // Check if the visitor is following the profile user
    if (!isOwnProfile && loginUser) {
      const follow = await Follow.findOne({
        follower: followerId,
        author: author._id
      });
      if (follow) {
        followStatus = "Following";
      }
    }

    // Add the shared profile data to the response locals
    req.isOwnProfile = isOwnProfile;
    req.followStatus = followStatus;
    console.log(isOwnProfile);
    console.log(followStatus);

    next();
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
};


exports.register=async(req,res)=>{
    console.log(req.body)
    try{
         
        const uname = req.body.username;
    const prf = req.body.profile;
    const email = req.body.email;
    const password = req.body.password;

    if (uname && prf && email && password) {
      // Check if the email is already registered
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        // res.send("Please try with another mail");
        const successMessage = "Username is already taken. Please try with another username";
        
        res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
        
      }
      const existingUsername = await User.findOne({ username: uname });
      if (existingUsername) {
        const successMessage = "Username is already taken. Please try with another username";
        // return res.send("Username is already taken. Please try with another username.");
        res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
      }

      let salt = bcrypt.genSaltSync(10);
      req.body.password = bcrypt.hashSync(req.body.password, salt);
        const registerdata={
        username:req.body.username,
        profile:req.body.profile,
        email:req.body.email,
        password:req.body.password
        
        
        }
    
        const newregister=new User(registerdata);
        await newregister.save();
        // res.status(201).render(home-guest);
        const successMessage = "Registeration Successfull";
        res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
        console.log("successfull");
    }
    else{
      const successMessage = "Please fill all the entry correctly";
      res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
    }
        
    }catch(error) {
        console.log(error);
    }
}


exports.login = async (req, res) => {
    console.log(req.body);
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        req.session.flash.errors=["Username and password are required"];
        // return res.status(400).json({ error: "Username and password are required" });
        const successMessage = "Enter valid UserName or Password";
        return res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
      }
      // retrieve the user from the database
      const user = await User.findOne({ username: username});
      // check if the user exists
      if (!user) {
        // return res.status(401).json({ error: "Invalid username or password" });
        req.session.flash.errors=["Invalid username or password"];
        const successMessage = "Invalid User Name";
        return res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
        // return res.redirect('/')
      }
      // validate the password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // return res.status(401).json({ error: "Invalid username or password" });
        req.session.flash.errors=["Invalid username or password"];
        // res.send("Incoorect Password");
        const successMessage = "Invalid Password";
        return res.redirect(`/?success=${encodeURIComponent(successMessage)}`);
        // return res.redirect('/');
       
      }
     
    const avatarUrl = user.avatar;
    req.session.user={username:user.username,avatar: avatarUrl,_id: user._id }
    // req.session.password={password:user.password}
    req.session.save(()=>res.redirect('/'))
   
    } catch (error) {
        
      console.log(error);
    
    
    req.session.save(()=>res.redirect('/'))
   
    }
  };

  exports.logout=(req,res)=>{
    req.session.destroy(()=>res.redirect('/'))
  }
  
  // exports.home=(req,res)=>{
  //   console.log(req.session)
  //   if(req.session.user){
  //       res.render('home-dashboard')

  //   }
  //   else{
  //   res.render('home-guest',{errors:req.flash('errors')})
  //   }
  // }


  exports.home = async (req, res) => {
    console.log("home hai");
    console.log(req.session);
  
    try {
      if (req.session.user) {
        const userId = req.session.user._id;
  
        // Find all the users followed by the logged-in user
        const loggedInUserId = req.session.user._id;
        console.log(loggedInUserId);
        

        const following = await Follow.find({ follower: userId });
        const followerIds = following.map(follow => follow.author);
        const posts = await Post.find({ author: { $in: followerIds } }).sort({ createdAt: -1 });;



        console.log(posts);
        console.log("postsbdh")
        const postsWithDetails = await Promise.all(posts.map(async post => {
          const author = await User.findById(post.author);
          return {
            ...post._doc,
            author: {
              username: author.username,
              avatar: author.avatar
            }
          };
        }));
        console.log(postsWithDetails);
        
  
  
        res.render('home-dashboard', { posts:postsWithDetails });
      } else {
        res.render('home-guest', { errors: req.flash('errors') });
      }
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  };
  
  

//   exports.ifUserExists=(req,res,next)=>{
//     User.findOne(req.params.username).then(userDoc =>{
//         req.profileUser=userDoc

//     }).catch(()=>{
//         res.render('404');
//     })

//   }

// exports.ifUserExists = async (req, res) => {
//     try {
      
  
//       const user = await User.findOne({ username: req.params.username });
  
//       if (user) {
//         // res.status(200).json({ exists: true });
//         req.profileUser={
//             _id:req.params.id,
//             username:user.username,
//             avatar:user.avatar,
//             profile:user.profile
            
            
//       }
//     }else {
//         res.status(200).json({ exists: false });
//       }
//     } catch (error) {
//         res.render('404');
//     }
//   };

exports.ifUserExists = (req, res, next) => {
    const username = req.params.username;
  
    User.findOne({ username: username })
      .exec()
      .then(userDoc => {
        console.log(userDoc);
        console.log("ho gya");
        if (userDoc) {
          const user = {
            _id: userDoc._id,
            username: userDoc.username,
            profile: userDoc.profile,
            avatar: userDoc.avatar
          };
        //   resolve(user);
          req.profileUser = user;
          next()
        } else {
          res.render('404');
        }
      })
      .catch(error => {
        console.log(error);
        res.render('404');
      });
  };
  
  
  
  exports.profilePostScreen = async (req, res, next) => {
    try {
    const postId = req.params.id;
    console.log(postId);
    console.log("ho gya2");
    // const post = await Post.findOne({ _id: postId }).toArray();
    const profileUser = req.profileUser; 
    
    const posts = await Post.find({ author: profileUser._id }).lean();
    // const postIds = posts.map(post => post._id); 
    // console.log(posts);
    const profileusername = profileUser.username;
    
    const profileProfile = profileUser.profile;
    const profileAvatar=profileUser.avatar;
    console.log(profileAvatar);

    res.render('profile', { 
        posts: posts, 
        profileusername: profileusername, 
        profileProfile: profileProfile,
        profileAvatar:profileAvatar,
        isOwnProfile: req.isOwnProfile,
        followStatus: req.followStatus
      });
    } catch (error) {
      console.log(error);
      res.render('404');
    }
};


  
exports.profileFollowerScreen = async (req, res, next) => {
  console.log("follower screen");
  try {
    const username = req.params.username; // Get the username from the URL
    console.log(username);

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all the followers of the user
    const followers = await Follow.find({ author: user._id });
    // console.log(followers);

    // Fetch the user objects for each follower
    const followerIds = followers.map(follower => follower.follower);
    const followerUsers = await User.find({ _id: { $in: followerIds } });
    console.log(followerUsers);

    // Map the username from followerUsers to followers array
    const followersWithDetails = followers.map(follower => {
      const followerUser = followerUsers.find(user => user._id.equals(follower.follower));
      return {
        username: followerUser.username,
        email: followerUser.email,
        avatar: followerUser.avatar,
        // Include other fields from follower if needed
      };
    });
    console.log(followersWithDetails);
    const profileUser = req.profileUser; 
    
    
   
    const profileusername = profileUser.username;
    
    const profileProfile = profileUser.profile;
    const profileAvatar=profileUser.avatar;
    

    res.render('profile-followers', { user, followers: followersWithDetails,
      profileusername: profileusername, 
      profileProfile: profileProfile,
      profileAvatar:profileAvatar,
     
      isOwnProfile: req.isOwnProfile,
      followStatus: req.followStatus });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
};

exports.profileFollowingScreen = async (req, res, next) => {
  console.log("following screen");
  try {
    const username = req.params.username; // Get the username from the URL
    console.log(username);

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all the users whom the current user is following
    const following = await Follow.find({ follower: user._id });
    console.log(following);

    // Fetch the user objects for each following user
    const followingIds = following.map(follow => follow.author);
    const followingUsers = await User.find({ _id: { $in: followingIds } });

    // Map the username, email, and avatar from followingUsers to following array
    const followingWithDetails = following.map(follow => {
      const followingUser = followingUsers.find(user => user._id.equals(follow.author));
      return {
        username: followingUser.username,
        email: followingUser.email,
        avatar: followingUser.avatar,
        // Include other fields from followingUser if needed
      };
    });
    console.log(followingWithDetails);
    const profileUser = req.profileUser; 
    
    
   
    const profileusername = profileUser.username;
    
    const profileProfile = profileUser.profile;
    const profileAvatar=profileUser.avatar;

    res.render('profile-following', { user, following: followingWithDetails,
      profileusername: profileusername, 
      profileProfile: profileProfile,
      profileAvatar:profileAvatar,
     
      isOwnProfile: req.isOwnProfile,
      followStatus: req.followStatus });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
};




  
   
