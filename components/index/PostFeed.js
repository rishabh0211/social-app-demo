import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import NewPost from "./NewPost";
import { addPost, getPostFeed, deletePost, unlikePost, likePost, addComment, deteleComment } from "../../lib/api";
import Post from "./Post";

class PostFeed extends React.Component {
  state = {
    posts: [],
    text: '',
    image: '',
    isAddingPost: false,
    isDeletingPost: false
  };

  componentDidMount() {
    this.postData = new FormData();
    this.getPosts();
  }

  getPosts = () => {
    const { auth } = this.props;

    getPostFeed(auth.user._id)
      .then(posts => {
        this.setState({ posts });
      });
  };

  handleChange = event => {
    let { name, value } = event.target;
    if (name === "image") {
      value = event.target.files[0];
    }
    this.postData.set(name, value);
    this.setState({
      [name]: value
    });
  };

  handleAddPost = () => {
    const { auth } = this.props;
    this.setState({
      isAddingPost: true
    });
    addPost(auth.user._id, this.postData)
      .then(postData => {
        const updatedPosts = [postData, ...this.state.posts];
        this.setState({
          posts: updatedPosts,
          isAddingPost: false,
          text: '',
          image: ''
        });
        this.postData.delete('image');
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isAddingPost: false
        });
      });
  };

  handleDeletePost = deletedPost => {
    this.setState({ isDeletingPost: true });
    deletePost(deletedPost._id)
      .then(postData => {
        const postIndex = this.state.posts.findIndex(post => post._id === postData._id);
        const updatedPosts = [
          ...this.state.posts.slice(0, postIndex),
          ...this.state.posts.slice(postIndex + 1)
        ];
        this.setState({ posts: updatedPosts, isDeletingPost: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isDeletingPost: false });
      });
  };

  handleToggleLike = post => {
    const { auth } = this.props;
    const isPostLiked = post.likes.includes(auth.user._id);
    const sendRequest = isPostLiked ? unlikePost : likePost;
    sendRequest(post._id)
      .then(postData => {
        const postIndex = this.state.posts.findIndex(post => post._id === postData._id);
        const updatedPosts = [
          ...this.state.postsd(0, postIndex),
          postData,
          ...this.state.posts.slice(postIndex + 1)
        ]
        this.setState({ posts: updatedPosts });
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleAddComment = (postId, text) => {
    const comment = { text };
    addComment(postId, comment)
      .then(postData => {
        const postIndex = this.state.posts.findIndex(post => post._id === postData._id );
        const updatedPosts = [
          ...this.state.posts.slice(0, postIndex),
          postData,
          ...this.state.posts.slice(postIndex + 1)
        ]
        this.setState({ posts: updatedPosts });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleDeleteComment = (postId, comment) => {
    deteleComment(postId, comment)
      .then(postData => {
        const postIndex = this.state.posts.findIndex(post => post._id === postData._id );
        const updatedPosts = [
          ...this.state.posts.slice(0, postIndex),
          postData,
          ...this.state.posts.slice(postIndex + 1)
        ]
        this.setState({ posts: updatedPosts });
      })
      .catch(err => console.log(err));
  }

  render() {
    const { classes, auth } = this.props;
    const { text, image, isAddingPost, posts, isDeletingPost } = this.state;
    return (
      <div className={classes.root}>
        <Typography variant="h4" component="h1" align="center" color="primary" className={classes.title}>
          Post Feed
      </Typography>
        <NewPost
          auth={auth}
          text={text}
          image={image}
          isAddingPost={isAddingPost}
          handleChange={this.handleChange}
          handleAddPost={this.handleAddPost}
        />
        {posts.map(post => (
          <Post
            key={post._id}
            auth={auth}
            post={post}
            isDeletingPost={isDeletingPost}
            handleDeletePost={this.handleDeletePost}
            handleToggleLike={this.handleToggleLike}
            handleAddComment={this.handleAddComment}
            handleDeleteComment={this.handleDeleteComment}
          />
        ))}
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    paddingBottom: theme.spacing.unit * 2
  },
  title: {
    padding: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(PostFeed);
