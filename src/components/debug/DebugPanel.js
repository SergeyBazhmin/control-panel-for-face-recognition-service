import React, { Component } from 'react';
import DebugHeader from './DebugHeader';
import DebugRow from './DebugRow';
import MyDropZone from './MyDropZone';
import { USE_JWT, RECOGNITION_ENDPOINT } from '../../constants';
import PropTypes from 'prop-types';
import { doTwiceIfExpired } from '../../utils/tokenUtils';
import io from 'socket.io-client';


export default class DebugPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            requests: []
        };
    }

    componentDidMount() {
        this.socket = io(`${this.props.host}/debug`);
        this.socket.emit('debug', true);
        this.socket.on('recognition', request => {
            let req = this.state.requests;
            if (req.length === 2) {
                req = [request, req[0]]
            } else req.push(request);
            this.setState({
                requests: [...req]
            });
        });
        console.log(`connecting to ${this.props.host}`);
    }

    componentWillUnmount() {
        this.socket.emit('debug', false);
        this.socket.close();
        console.log(`disconnecting to ${this.props.host}`);
    }

    async sendImage(image) {
        try {
            if (USE_JWT) {
                await doTwiceIfExpired(this._recognitionRequest(image));
            }
            else await this._recognitionRequest(image)('');
        } catch(error) {
            console.log(error);
        }
    }

    _recognitionRequest(image) {
        return async (token) => {
            let response = await fetch(`${this.props.host}/${RECOGNITION_ENDPOINT}`, 
                {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body:JSON.stringify({'photo': image})
                });
            response = await response.json();
            return response;
        }
    }

    render() {
        return (
            <div clasName='debug-container'>
                <MyDropZone onImageLoaded={(base64Image) => this.sendImage(base64Image)}/>
                <DebugHeader />
                {this.state.requests.map(req => (<DebugRow data={req}/>))}
            </div>
        );
    }
}

DebugPanel.propTypes = {
    host: PropTypes.string.isRequired
};
