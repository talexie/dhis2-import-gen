import * as React from 'react';
import { css } from '@emotion/react';
const container = css({
    display: 'flex'
});
const spanCss = css({
    display: 'block'
});
const highlighted = css({
    '.highlighted': {
        paddingRight: '4px'
    }
});

/**
 * @param {Object} props
 * @param {bool} props.highlighted
 * @param {React.Component|React.Component[]} props.children
 * @returns {React.Component}
 */
export const LabelContainer = ({ children }) => (
    <div css={container}>
        <span css={ [spanCss,highlighted] }>{children}</span>
    </div>
)
