import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import WorkerInstance from './WorkerInstance';
import { CREATE_WORKER_ENDPOINT, USE_JWT, WORKERS_ENDPOINT, MODEL_ENDPOINT } from '../constants';
import DebugPanel from './debug/DebugPanel';
import {Line as LineChart} from 'react-chartjs-2';
import Button from '@material-ui/core/Button';
import { doTwiceIfExpired } from '../utils/tokenUtils';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import './ServerInstance.css';


export default class ServerInstance extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 0,
            runningWorkers: [],
            requestChartData: [],
            responseChartData: [],
            pcInfo: null
        };
        this._spawnWorker = this._spawnWorker.bind(this);
        this._killWorker = this._killWorker.bind(this);
    }

    async componentDidMount() {
        console.log('Server instance mounting...');
        try {
            console.log(this.props.hostname);
            this.socket = io(this.props.hostname);
            this.socket.on('data', data => {
                const reqData = this.state.requestChartData;
                const resData = this.state.responseChartData;
                if (reqData.length === 5) {
                    reqData.shift();
                }
                if (resData.length === 5) {
                    resData.shift();
                }
                this.setState({
                    requestChartData: [...this.state.requestChartData, data.nrequests],
                    responseChartData: [...this.state.responseChartData, data.nresponses],
                    pcInfo: data
                });
            });
            this.socket.on('workers', workers => {  
                this.setState({
                    runningWorkers: [...workers]
                })
            });
            this.socket.emit('poll_data');
            this.socket.emit('poll_workers');
            const dataInterval = setInterval(() => this.socket.emit('poll_data'), 10000);
            const workerInterval = setInterval(() => this.socket.emit('poll_workers'), 30000);
            this.setState({
                dataInterval,
                workerInterval
            });
            console.log('server instance mounted');
        } catch(error) {
            console.log(error);
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.dataInterval);
        clearInterval(this.state.workerInterval);
    }

    async handleSpawnClick() {
        try {
            let json;
            if (USE_JWT) {
                json = await doTwiceIfExpired(this._spawnWorker);
            } else {
                console.log('wtf');
                json = await this._spawnWorker('');
            }
            this.setState({
                runningWorkers: [...this.state.runningWorkers, json.id]
            });
        } catch(error) {
            console.log(error);
        }
    }

    async _spawnWorker(token) {
        console.log(`${this.props.hostname}/${CREATE_WORKER_ENDPOINT}`);
        const response = await fetch(`${this.props.hostname}/${CREATE_WORKER_ENDPOINT}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const json = await response.json();
        console.log(json);
        return json;
    }

    _killWorker(id) {
        return async (token) => {
            let response = await fetch(`${this.props.hostname}/${WORKERS_ENDPOINT}/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: {}
            });
            response = await response.json();
            return response;
        }
    }

    async _getModelName(token) {
        let response = await fetch(`${this.props.hostname}/${MODEL_ENDPOINT}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        response = await response.json();
        return response;
    }

    async handleKillClick(id) {
        try {
            let json;
            if (USE_JWT){
                json = await doTwiceIfExpired(this._killWorker(id));
            } else {
                json = await this._killWorker(id)('');
            }
            console.log(json);
            this.setState({
                runningWorkers: this.state.runningWorkers.filter(workerID => workerID !== id)
            });
        } catch(error) {
            console.log(error);
        }
        
    }

    handleTabChange(e, value) {
        this.setState({tab: value});
    }

    prepareChartData() {
        const reqData = [...this.state.requestChartData];
        const resData = [...this.state.responseChartData];
        let labels = [];
        for (let i = reqData.length; i > 0 ; --i)
            labels.push(i*15);
        return {
            labels,
            datasets: [
                {
                    label: 'number of requests',
                    data: reqData,
                    fill:false,
                    pointBackgroundColor: 'rgba(95, 158, 160, 1)',
                    pointRadius: 6,
                    backgroundColor: 'rgba(95, 158, 160, 1)',
                },
                {
                    label: 'number of responses',
                    data: resData,
                    fill:false,
                    pointBackgroundColor: 'rgba(255, 0, 0, 1)',
                    pointRadius: 9,
                    backgroundColor: 'rgba(255,0,0,1)',
                }
            ]
        };
    }

    getChartOptions(title, labelX, labelY) {
        return {
            title: {
                display: true,
                text: title,
                fontSize: 20
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    },
                    scaleLabel: {
                        display: true,
                        labelString: labelY,
                        fontSize: 20
                    }
                }],
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: labelX,
                    fontSize: 20
                  }
                }],
              }     
        };
    }
    
    render() {
        return (
            <div className='server-instance'>
                <AppBar position="static">
                    <Tabs value={this.state.tab} onChange={(e, value) => this.handleTabChange(e, value)}>
                        <Tab label="Workers" />
                        <Tab label="Debug" />
                    </Tabs>
                </AppBar>
                {this.state.tab === 0 &&
                <div>
                    <div className='pad-container'>
                        <div className='server-header'>
                            {this.props.hostname}
                        </div>
                        <div className='server-workers'>
                            <div className='model'>
                                <div className='row'>
                                    <div className='model-instance-item model-instance-name'>
                                        Model
                                    </div>
                                    <div className='model-instance-item'>
                                        <Button onClick={() => this.handleSpawnClick()}variant="outlined" color="primary">
                                            Spawn
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            { this.state.runningWorkers.length > 0 &&
                            <div className='running-workers'>
                                <div className='running-workers-header'>Running Workers</div>
                                {this.state.runningWorkers.map((worker, idx) => (<WorkerInstance
                                  name={`worker-${idx+1}`} key={idx} id={worker} buttonText={'Kill'} handleClick={() => this.handleKillClick(worker)}/>))}
                            </div>
                            }
                        </div>
                    </div>
                    <div className='info-container'>
                        <div className='chart-container'>
                            <LineChart data={this.prepareChartData()}
                            options={this.getChartOptions('Request statistics', 'Seconds ago', '# requests')} />
                        </div>
                            {this.state.pcInfo && 
                            <div className='pc-stats-container'>
                                <span className='pc-info-label'>RAM (Mb):</span>
                                <ul>
                                    {Object.entries(this.state.pcInfo.RAM).map(([key, value]) => (<li key={key}>{key}: {value}</li>))}
                                </ul>
                                <span className='pc-info-label'>CPU:</span>
                                <ul>
                                    {Object.entries(this.state.pcInfo.CPU).map(([key, value]) => (<li key={key}>{key}: {value}</li>))}
                                </ul>
                            </div>
                            }
                    </div>
                </div>
                }
                {this.state.tab === 1 && 
                <DebugPanel host={this.props.hostname}/>
                }
                <div className='disconnect-button'>
                    <Button onClick={() => this.props.closeInstance(this.props.hostname)} variant="outlined" color="primary">
                        Disconnect
                    </Button>
                </div>
            </div>
        );
    }
}

ServerInstance.propTypes = {
    hostname: PropTypes.string.isRequired
};