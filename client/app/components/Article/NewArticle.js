import React from "react";
import { hashHistory } from "react-router";
import {
  Row,
  Col,
  Button,
  Form,
  Clearfix,
  FormGroup,
  FormControl
} from "react-bootstrap";
import Loader from "Loader/index";
import Alert from "react-s-alert";
import API from "api/wrapper.js";

import WikiEditor from "../WikiEditor/index.jsx";
import TopicChooser from "./TopicChooser";

// TODO EditArticle & ViewArticle are one and the same - make it into one component
class NewArticle extends React.Component {
  constructor(...args) {
    super(...args);

    this.onChange = this.onChange.bind(this);
    this.getStringifiedEditorContent = this.getStringifiedEditorContent.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      article: {
        title: "",
        topic_id: 1
      },
      topics: [],
      loading: true
    };
  }

  componentDidMount() {
    this.setState({
      loading: true
    });

    API.call(
      "topics",
      "GET",
      window.localStorage.getItem("userToken")
    ).then(response => {
      this.setState({
        topics: response.data,
        loading: false
      });
    });
  }

  onChange(e) {
    const { name, value } = e.target;

    this.setState({
      article: Object.assign({}, this.state.article, {
        [name]: value
      })
    });
  }

  getStringifiedEditorContent() {
    return JSON.stringify(this.refs.editor.getRawContent());
  }

  handleSubmit(e) {
    e.preventDefault();

    // get the rawContent from refs
    // TODO this will change when we use Redux! :)
    const body = this.getStringifiedEditorContent();
    const { title, topic_id } = this.state.article;

    if (body && title && topic_id) {
      const userId = window.localStorage.getItem("userId");
      const userToken = window.localStorage.getItem("userToken");
      // TODO DO SOMETHING ABOUT THIS! It's getting out of hand! x(
      const payload = {
        title: encodeURIComponent(title),
        body: encodeURIComponent(body),
        topic_id: topic_id,
        user_id: userId
      };

      API.call("articles", "POST", userToken, payload).then(response => {
        Alert.success("Article has been successfully saved");
        hashHistory.push(`article/${response.data.id}`);
      });
    } else {
      Alert.error("Article Body, Title and Topic Information is required.");
    }
  }

  render() {
    const { loading, topics, article } = this.state;

    return (
      (loading && <Loader />) ||
      <Form className="new-article" onSubmit={this.handleSubmit}>
        <Col sm={12}>
          <FormGroup>
            <FormControl
              type="text"
              name="title"
              className="input-title"
              placeholder="Enter article title..."
              value={article.title}
              onChange={this.onChange}
            />
          </FormGroup>
          <FormGroup>
            <WikiEditor ref="editor" />
          </FormGroup>
          <FormGroup>
            <TopicChooser
              onChange={this.onChange}
              topics={topics}
              value={article.topic_id}
            />
          </FormGroup>
        </Col>
        <Clearfix />
        <br />
        <Col sm={12}>
          <Button type="submit" block={true}>
            Create Article
          </Button>
        </Col>
      </Form>
    );
  }
}

export default NewArticle;
