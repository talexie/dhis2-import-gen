import * as React from 'react';
import { css } from '@emotion/react';
const svgCss = css({
    display: 'block',
    margin: '-3px 0'
})
export const IconEmpty = () => (
    <svg
        height="18px"
        version="1.1"
        viewBox="0 0 18 18"
        width="18px"
        css = { svgCss }
    >
        <g
            fill="none"
            fillRule="evenodd"
            id="icon/empty"
            stroke="none"
            strokeWidth="1"
        />
    </svg>
)
