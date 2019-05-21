import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DebugRow.css';

export default class GridRow extends Component {
    render() {
        const now = new Date();
        const data = this.props.data;
        return (
            <div className='debug-row'>
                <div className='image-box'><img src={`data:image/jpeg;base64,${data.photo}`} alt={''}/></div>
                <div className='text-box'>{data.person}</div>
                <div className='text-box'>{data.distance}</div>
                <div className='text-box'>{String(now)}</div>
            </div>
        );
    }
}

GridRow.propTypes = {
    data: PropTypes.object.isRequired
};