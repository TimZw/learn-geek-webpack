'use strict';

// import React from 'react';
// import ReactDOM from 'react-dom';
// import '../../common';
// import './search.scss';
// import Logo from './images/test.png';
// import Run from './images/run.png';
// import { a } from './tree-shaking';

const React = require('react');
require('./search.scss');
const Logo = require('./images/test.png');
const Run = require('./images/run.png');

class Search extends React.Component {
    constructor(...args) {
        super(...args);

        this.state = {
            Text: null,
        };
    }

    loadComponent() {
        /* 动态import 返回promise对象 */
        import('./text.js').then((Text) => {
            this.setState({
                Text: Text.default,
            });
        });
    }


    render() {
        const { Text } = this.state;

        return <div className="search-text">
            {Text ? <Text /> : null}
            搜索文字
            <img src={ Logo } onClick={this.loadComponent.bind(this)} alt="logo" />
            <img src={ Run } />
            </div>;
    }
}

module.exports = <Search />;