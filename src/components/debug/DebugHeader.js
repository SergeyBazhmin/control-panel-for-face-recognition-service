import React, { Component } from 'react';
import './DebugRow.css';
import './DebugHeader.css';

export default class DebugHeader extends Component {

    render() {
        return (
            <div className="debug-row" id='debug-header'>
                <div className="text-box">Image</div>
                <div className="text-box">Person</div>
                <div className='text-box'>Euclidean distance</div>
                <div className="text-box">Date</div>
            </div>
        );
    }
}