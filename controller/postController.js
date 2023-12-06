const Post = require('../models/Post');
const Users = require('../models/register');

exports.viewCreatePage=(req,res)=>{
    res.render('create-post')
}






exports.createPost = async (req, res) => {
    console.log(req.body);
    try {
      const title = req.body.title;
      const content = req.body.body;
  
      if (title !== "" && content !== "") {
        // const authorId = req.session.user._id;
        // const author = await Users.findOne({ _id: authorId });
        const postdata = {
          title: title,
          body: content,
          author: req.session.user._id,
          createdAt: new Date(),
        };
  
        const newpost = new Post(postdata);
        await newpost.save();
        // res.send("Post created successfully");
        res.redirect(`/post/${newpost._id}`);
        console.log("Successful");
      } else {
        res.send("Both title and content are required");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  };
   
exports.viewSingle= async (req,res)=>{
  try{
    // console.log(req.params.id);
    const postId = req.params.id;

    // const post = await Post.findById(postId).populate("author");
    // const post = await Post.findById({_id:new ObjectID});
    // const post = await Post.findById(mongoose.Types.ObjectId(_id)).populate('author');
    const post = await Post.findOne({ _id: postId });
    // const author = await Users.findOne({ _id: postId });


    if (!post) {
      req.session.flash.errors = ["Post not found"];
      return res.redirect("/");
    }


    // let post= await Post.findOne(req.params.id)
    const visitorId = req.visitorId;
    const author = await Users.findById(post.author);
    const isAuthor = author._id.equals(visitorId);
    
    res.render('single-post-screen', { post:post ,authorName: author.username ,avatar:author.avatar,visitorId: visitorId,isAuthor: isAuthor})

  }catch{
    res.render('404');
  }
 
}


exports.viewEditScreen=async(req,res)=>{
  try{
    
    const postId = req.params.id;

    
    const post = await Post.findOne({ _id: postId });
   


    if (!post) {
      req.session.flash.errors = ["Post not found"];
      return res.redirect("/");
    }


    
    const visitorId = req.visitorId;
    const author = await Users.findById(post.author);
    const isAuthor = author._id.equals(visitorId);
    if(visitorId && isAuthor){
      res.render('edit-post',{post:post})
    } else{
      req.flash("errors", "You do not have permisssion to perform this action")
      res.redirect("/")
    }
    

  }catch{
    res.render('404');

  }
}



exports.edit = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      req.session.flash.errors = ["Post not found"];
      return res.redirect("/");
    }

    // Check if the current user is the author of the post
    const visitorId = req.visitorId;
    const isAuthor = post.author.equals(visitorId);

    if (!isAuthor) {
      req.session.flash.errors = ["You are not authorized to edit this post"];
      return res.redirect("/");
    }

    // Update the post content with the new values from the request body
    post.title = req.body.title;
    post.body = req.body.body;
    await post.save();
    // req.flash('success', 'Post created successfully');
    

    const successMessage = "Post update successfully";
    res.redirect(`/post/${postId}/edit?success=${encodeURIComponent(successMessage)}`);
 
  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to update the post');
    res.render('404');
  }
};

exports.delete = async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post by its ID
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      req.session.flash.errors = ["Post not found"];
      return res.redirect("/");
    }

    // Check if the current user is the author of the post
    const visitorId = req.visitorId;
    const isAuthor = post.author.equals(visitorId);

    if (!isAuthor) {
      req.session.flash.errors = ["You are not authorized to delete this post"];
      return res.redirect("/");
    }

    // Delete the post
    await Post.deleteOne({ _id: postId });
    // req.session.flash.success = ["Post deleted"];
    const successMessage = "Post delete successfully";
    res.redirect(`/profile/${req.session.user.username}?success=${encodeURIComponent(successMessage)}`);

    // Redirect to a success page or a different route
    // res.redirect("/success");
  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to delete the post');
    es.redirect("/")
  }
};

exports.search = async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm; 

    // Find posts that match the search term
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in the title
        { body: { $regex: searchTerm, $options: 'i' } } // Case-insensitive search in the body
      ]
    });
    console.log("hello");
    
    console.log(posts);
    console.log("hiihhhhh");

    res.json({ posts: posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
};


