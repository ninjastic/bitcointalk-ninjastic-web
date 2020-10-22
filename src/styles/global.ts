import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    html {
        box-sizing: border-box;
        overflow-y: scroll;
        background-color: var(--body-background);
    }
    
    body {
        height: auto;
        width: auto;
        background-color: var(--body-background);
    }
    
    #root {
        height: 100vh;
        background-color: var(--body-background);
    }

    *, *:before, *:after {
        box-sizing: inherit;
    }

    .quote {
        min-height: 48px;
        padding: 12px;
        border: 1px solid var(--border-color-base);
        border-bottom: 1px solid var(--border-color-base);
        background-color: var(--quote-background);
        border-radius: 2px 2px 0 0;
        margin-left: 6px;
        margin-bottom: 4px;
    }

    .code {
        font-family: "courier new", "times new roman", monospace;
        font-size: 12px;
        line-height: 1.3em;
        border: 1px solid var(--border-color-base);
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
        text-decoration: none;
        font-style: normal;
        font-weight: bold;
        padding: 12px;
        margin-left: 6px;
        margin-top: 6px;
        border: 1px solid var(--border-color-base);
        background-color: var(--quote-background);
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
        text-decoration: none;
        outline: none;
        cursor: pointer;
        -webkit-transition: color .3s;
        transition: color .3s;
        -webkit-text-decoration-skip: objects;
    }

    .ant-card-extra {
        max-width: 30%;
    }

    .Difference {
        margin: 0 .2em;
        padding: .2em .4em .1em;
        font-size: 85%;
        background: hsla(0,0%,58.8%,.1);
        border: 1px solid hsla(0,0%,39.2%,.2);
        border-radius: 3px;
    }

    .Difference ins {
        background-color: rgb(1, 50, 32);
        text-decoration: none;
    }

    .Difference del {
        background-color: rgb(139, 0, 0);
        text-decoration: none;
    }

    .ant-collapse-no-arrow >.ant-collapse-header {
        cursor: initial !important;
    }
`;

export default GlobalStyle;
