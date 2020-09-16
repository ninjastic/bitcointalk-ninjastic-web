import { createGlobalStyle } from 'styled-components';

import 'antd/dist/antd.dark.min.css';

const GlobalStyle = createGlobalStyle`
    html {
        box-sizing: border-box;
        overflow-y: scroll;
        background-color: #1D1D1D;
    }

    *, *:before, *:after {
        box-sizing: inherit;
    }
    
    body {
        height: auto;
        width: auto;
        background-color: #1D1D1D;
    }

    #root {
        height: 100vh;
        background-color: #1D1D1D;
    }

    .quote {
        min-height: 48px;
        padding: 12px;
        background: #1D1D1D;
        border: 1px solid #303030;
        border-bottom: 1px solid #303030;
        border-radius: 2px 2px 0 0;
        margin-left: 6px;
        margin-bottom: 4px;
    }

    .code {
        background-color: #1D1D1D;
        font-family: "courier new", "times new roman", monospace;
        font-size: 12px;
        line-height: 1.3em;
        border: 1px solid #303030;
        padding: 5px;
        margin: 1px 3px 4px 6px;
        width: 93%;
        white-space: nowrap;
        overflow: auto;
        max-height: 24em;
    }

    .codeheader {
        padding: 0;
        margin-left: 6px;
        font-size: 16px;

        border-radius: 3px 3px 0 0;
    }

    .quoteheader {
        color: #476C8E;
        text-decoration: none;
        font-style: normal;
        font-weight: bold;

        padding: 12px;
        margin-left: 6px;
        margin-top: 6px;
        background: #1D1D1D;
        border: 1px solid #303030;
        border-bottom: 0;
        border-radius: 2px 2px 0 0;
    }

    img {
        max-width: 100%;
    }

    .post, .post .ant-card-body a, .post table {
        max-width: 100%;
        width: 100% !important;
        word-break: break-word;
    }

    .ant-card-head-title {
        white-space: pre-wrap;
    }

    a {
        color: #258ae8;
        text-decoration: none;
        background-color: transparent;
        outline: none;
        cursor: pointer;
        -webkit-transition: color .3s;
        transition: color .3s;
        -webkit-text-decoration-skip: objects;
    }

    post b, post b a, span, a.ul {
        color: unset;
    }

    post .quoteheader b {
        color: #258ae8;
    }

    .ant-card-extra {
        max-width: 30%;
    }
`;

export default GlobalStyle;
