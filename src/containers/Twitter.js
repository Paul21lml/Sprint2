import React, { Component } from "react";
import ReactDOM from "react-dom";
import Icon from "react-fontawesome";
import Loading from "../components/Loading";
import Results from "../components/Results";

import {
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  Button
} from "reactstrap";
import MainMenu from "../components/MainMenu";

class Twitter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rawTextContent: "",
      wordCount: "0",
      submitColor: "secondary",
      submitDisallow: true,
      fetchingData: false,
      loadingmsg: "",
      responseDataRecieved: false,
      responseData: {}
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.tryAgain = this.tryAgain.bind(this);
  }

  handleChange(event) {
    this.setState({
      rawTextContent: event.target.value
    });

    let wordCount = event.target.value;
    wordCount = wordCount.replace(/^\s+|\s+$/g, "");

    if (wordCount === "") {
      wordCount = 0;
    } else {
      wordCount = wordCount.split(/\s+/).length;
    }

    if (wordCount === 0) {
      this.setState({
        submitDisallow: true,
        submitColor: "secondary"
      });
    } else if (wordCount > 0) {
      this.setState({
        submitDisallow: false,
        submitColor: "success"
      });
    }
  }
  focusInput(component) {
    if (component) {
      ReactDOM.findDOMNode(component).focus();
    }
  }
  handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    this.setState({
      fetchingData: true,
      loadingmsg: "Fetching tweets"
    });

    fetch(process.env.REACT_APP_WATSON_API_ENDPOINT + "twitter.php", {
      method: "POST",
      body: formData
    })
      .then(function(response) {
        return response.json();
      })
      .then(
        function(data) {
          if (data.error) {
            this.setState(
              {
                rawTextContent: "",
                fetchingData: false
              },
              function() {
                alert(
                  "No hemos podido encontrar el usuario de twitter. Ingrese un usuario de twitter valido"
                );
              }
            );
          } else {
            this.setState(
              {
                rawTextContent: data.tweets,
                fetchingData: true,
                loadingmsg: "Consultando Personality Insights"
              },
              function() {
                var formData = new FormData();
                formData.append("raw-text-content", this.state.rawTextContent);
                fetch(process.env.REACT_APP_WATSON_API_ENDPOINT, {
                  method: "POST",
                  body: formData
                })
                  .then(function(response) {
                    return response.json();
                  })
                  .then(
                    function(data) {
                      if (data.error) {
                        this.setState(
                          {
                            fetchingData: false,
                            responseDataRecieved: false
                          },
                          function() {
                            alert(data.error + ". Porfavor intente de nuevo");
                          }
                        );
                      } else {
                        this.setState({
                          fetchingData: false,
                          responseData: data,
                          responseDataRecieved: true
                        });
                      }
                    }.bind(this)
                  );
              }
            );
          }
        }.bind(this)
      );
  }

  tryAgain() {
    this.setState({
      rawTextContent: "",
      wordCount: "0",
      submitColor: "secondary",
      submitDisallow: true,
      fetchingData: false,
      loadingmsg: "",
      responseDataRecieved: false,
      responseData: {}
    });
  }

  render() {
    return (
      <div>
        <MainMenu />
        {this.state.fetchingData && (
          <Loading loadingmsg={this.state.loadingmsg} />
        )}
        {!this.state.responseDataRecieved && (
          <Container className="twitter-wrapper hidden-load animated fadeIn">
            <h1 className="page-heading text-center">
              <Icon name="twitter" />
            </h1>

            <Form onSubmit={this.handleSubmit}>
              <InputGroup size="lg">
                <InputGroupAddon>@</InputGroupAddon>
                <Input
                  placeholder="twitter handle"
                  name="twitter-screen-name"
                  className="twitter-screen-name"
                  ref={this.focusInput}
                  onChange={this.handleChange}
                />
                <Button
                  className="twitter-handle-submit"
                  type="submit"
                  size="lg"
                  disabled={this.state.submitDisallow}
                  color={this.state.submitColor}
                >
                  Analyse
                </Button>
              </InputGroup>
            </Form>
          </Container>
        )}
        {this.state.responseDataRecieved && (
          <Results
            resultData={this.state.responseData}
            rawText={this.state.rawTextContent}
            tryAgain={this.tryAgain}
          />
        )}
      </div>
    );
  }
}

export default Twitter;
