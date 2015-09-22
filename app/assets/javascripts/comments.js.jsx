var Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {
      sanitize: true
    });
    return {
      __html: rawMarkup
    };
  },

  render: function() {
    return ( < div className = "" >
      < h2 className = "commentAuthor" > {
        this.props.author
      } < /h2> < span dangerouslySetInnerHTML = {
        this.rawMarkup()
      }
      /> < /div>
    );
  }
});

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({
          data: data
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error("1"+this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({
      data: newComments
    });
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: { comment: comment },
      success: function(data) {
        this.setState({
          data: data
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      data: []
    };
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return ( < div className = "" >
      < h1 > Comments < /h1> < CommentList data = {
        this.state.data
      }
      /> < CommentForm onCommentSubmit = {
        this.handleCommentSubmit
      }
      /> < /div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment, index) {
      return (

        < Comment author = {
          comment.author
        }
        key = {
          index
        } > {
          comment.text
        } < /Comment>
      );
    });
    return ( < div className = "" > {
      commentNodes
    } < /div>);
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({
      author: author,
      text: text
    });
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
  },
  render: function() {
    return ( < form className="form-inline"
      onSubmit = {
        this.handleSubmit
      } >
      < input type = "text"
      className = "form-control"
      placeholder = "Your name"
      ref = "author" / >
      < input type = "text"
      placeholder = "Say something..."
      className = "form-control"
      ref = "text" / >
      < input type = "submit"
      className="btn btn-default"
      value = "Post" / >
      < /form>
    );
  }
});


$(function() {
  var $content = $("#content");
  if ($content.length > 0) {
    React.render(
      <CommentBox url="comments.json" pollInterval={2000} />,
      document.getElementById('content')
    );
  }
})
