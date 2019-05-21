import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import './WorkerInstance.css';

export default class WorkerInstance extends Component {
    render() {
        return (
            <div className='worker-instance'>
                <div className='worker-instance-item worker-instance-name'>
                    {this.props.name}
                </div>
                <div className='worker-instance-item worker-instance-id'>
                    {this.props.id}
                </div>
                <div className='worker-instance-item'>
                    <Button onClick={() => this.props.handleClick()}variant="outlined" color="primary">
                        {this.props.buttonText}
                    </Button>
                </div>
            </div>
        );
    }
}

WorkerInstance.propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired
};