import React from 'react';
import './App.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ServerInstance from './components/ServerInstance';
import { OAUTH_HOST, USE_JWT, OAUTH_PORT, ACCESS_TOKEN_ENDPOINT } from './constants';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connections: [],
      textFieldValue: '',
    };
  }

  onTextFieldChanged(e) {
    this.setState({
      textFieldValue: e.target.value
    });
  }

  async componentDidMount() {
    if (USE_JWT){
      try {
        const response = await fetch(`http://${OAUTH_HOST}:${OAUTH_PORT}/${ACCESS_TOKEN_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({user: 'admin', password: 'admin'})
        });
        const json = await response.json();
        console.log(json);
        sessionStorage.setItem('access-token', json.access_token);
        sessionStorage.setItem('refresh-token', json.refresh_token);
      } catch(error) {
        console.log(error);
        return;
      }
    }

    const hosts = JSON.parse(sessionStorage.getItem('connections-list'));
    if (hosts === null) return;
    let pong = [];
    for (let host of hosts) {
      try {
        await fetch(`${host}/ping`);
        pong.push(host);
      } catch (error) {
        console.log(error);
        return;
      }
    }
    this.setState({
      connections: pong
    });
  }

  closeInstance(host) {
      const conn = this.state.connections.filter(hst => hst !== host);
      this.setState({
          connections: conn
      });
  }

  async onAddClicked() {
    const hostname = this.state.textFieldValue;
    try {
      await fetch(`${hostname}/ping`);
    } catch (error) {
      console.log(error);
      return;
    }
    const conn = [...this.state.connections, hostname];
    sessionStorage.setItem('connections-list', JSON.stringify(conn));
    this.setState({
      connections: conn
    });
  }

  render(){
    return (
      <div>
        <div id='app-header'>
          <div>
            <TextField
                onChange={(e) => this.onTextFieldChanged(e)}
                value={this.state.textFieldValue}
                id="outlined-with-placeholder"
                label="host"
                placeholder="host"
                margin="normal"
                variant="outlined"
              />
          </div>
          <div className='header-item'>
            <Button onClick={() => this.onAddClicked()} variant="outlined" color="primary">
              Add
            </Button>
          </div>
        </div>
        <div className='server-contents'>
          {this.state.connections.map((host, idx) => <div key={host}><ServerInstance hostname={host} closeInstance={(host) => this.closeInstance(host)}/></div>)}
        </div>
      </div>
    );
  }
}

export default App;
