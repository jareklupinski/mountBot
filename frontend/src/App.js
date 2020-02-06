import React, { Component } from 'react';
import { Widget, addResponseMessage, addLinkSnippet, addUserMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import logo from './logo.svg';

const URL = 'ws://localhost:8080/bot'

class App extends Component {

  constructor(props) {
      super(props);
      this.state=({
        counter: 0,
        wsid: 12345
      });
  }

  ws = new WebSocket(URL)

  componentDidMount() {
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
      const uuidv4 = require('uuid/v4');
      this.setState({
        wsid: uuidv4()
      })
    }
    this.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data)
      addResponseMessage(message.message);
    }
    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: new WebSocket(URL),
      })
    }
    
    addResponseMessage("Welcome to the Mount Sinai Personal Care System! Please type in your email address so we can begin.");
  }

  handleNewUserMessage = (newMessage) => {
    console.log(`New message incoming! ${newMessage}`);
    this.setState({ counter: this.state.counter + 1});
    const message = { name: this.state.wsid, message: newMessage }
    this.ws.send(JSON.stringify(message))
    // Now send the message throught the backend API
  }

  render() {
    return (
      <div className="App">
        <Widget
          handleNewUserMessage={this.handleNewUserMessage}
          profileAvatar={logo}
          title="Mount Sinai Care System"
          subtitle={this.state.counter}
        />
      </div>
    );
  } 
}

export default App;