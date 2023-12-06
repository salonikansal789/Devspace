
const Follow= require('../models/Follow')
const User = require('../models/register');
//create seprate collection in database which contain followeid and authorid
// dev ne subha ko follow kra authorid dev folowerid subha




  


// exports.addFollow = async function(req, res) {
//     console.log("hihahaha")
//   try {
//     const followerId = req.visitorId; // ID of the user who is following
//     const authorId = req.params.username; // ID of the user being followed
//     console.log(authorId);

//     // Create a new follow entry
//     // const author = await Users.findById(authorId);
//     // if (!author) {
//     //   return res.status(404).json({ error: 'Author not found' });
//     // }
//     const follow = new Follow({
//       follower: followerId,
//       author: authorId
//     });
//     console.log(follow);
//     const existingFollow = await Follow.findOne({
//         follower: followerId,
//         author: authorId
//       });
//       if (existingFollow) {
//         return res.status(400).json({ error: 'Already following the user' });
//       }

//     //   if (followerId === authorId) {
//     //     return res.status(400).json({ error: 'Cannot follow yourself' });
//     //   }

//     await follow.save();
//     console.log("try exec")
//     res.redirect(`/profile/${req.params.username}`);
//   } catch (error) {
//     console.log(error);
//     res.redirect('/');
//   }
// };

exports.addFollow = async function(req, res) {
    try {
      const followerId = req.visitorId; // ID of the user who is following
      const follower = await User.findById(followerId); // Follower user object
      const authorUsername = req.params.username; // Username of the user being followed
      const author = await User.findOne({ username: authorUsername }); // Author user object
  
      if (!author) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      if (followerId.toString() === author._id.toString()) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }
  
      const existingFollow = await Follow.findOne({
        follower: followerId,
        author: author._id
      });
  
      if (existingFollow) {
        return res.status(400).json({ error: 'Already following the user' });
      }
  
      const follow = new Follow({
        follower: follower._id,
        author: author._id
      });
  
      await follow.save();
      console.log("try exec");
      const followmessage="Successfully followed";
      res.redirect(`/profile/${req.params.username}?success=${encodeURIComponent(followmessage)}`);
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  };


exports.removeFollow = async function(req, res) {
  try {
    const followerId = req.visitorId; // ID of the user who wants to unfollow
    const authorUsername = req.params.username; // Username of the user being unfollowed

    // Find the follower user
    // const follower = await User.findById(followerId);
   
    // Find the author user
    const author = await User.findOne({ username: authorUsername });
    // if (!author) {
    //   return res.status(404).json({ error: 'Author not found' });
    // }

    // Check if the follow entry exists
    const follow = await Follow.findOne({
      follower: followerId,
      author: author._id
    });

    if (!follow) {
      return res.status(404).json({ error: 'Follow entry not found' });
    }

    // Remove the follow entry
    // await follow.remove();
    await Follow.deleteOne({ _id: follow._id });

    res.redirect(`/profile/${req.params.username}`);
    // console.log("done");
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
};

  
