// 'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import '../../common';
// import './search.css';
// import './search.less';
import './search.scss';
import Logo from './images/test.png';
import Run from './images/run.png';
import { a } from './tree-shaking';

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
            搜索文字的内容
            {a}
            <img src={Logo} onClick={this.loadComponent.bind(this)} alt="logo" />
            <img src={Run} />
            </div>;
    }
}

ReactDOM.render(
    <Search />,
    document.getElementById('root'),
);