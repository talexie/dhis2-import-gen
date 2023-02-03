import * as React from 'react';
import { css } from '@emotion/react';
const svgCss = css({
    display: 'block',
    margin: '-3px 0'
});
export const IconSingle = () => (
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
            id="icon/single"
            stroke="none"
            strokeWidth="1"
        >
            <rect
                fill="#A0ADBA"
                height="4"
                id="Rectangle"
                rx="1"
                width="4"
                x="7"
                y="7"
            />
        </g>
    </svg>
)
