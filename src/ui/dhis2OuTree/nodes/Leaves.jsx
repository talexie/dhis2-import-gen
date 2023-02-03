import * as React from 'react'
import { css } from '@emotion/react';
import PropTypes from 'prop-types';
const openCss = css({
    height: 'auto'
});
const root=css({
    height: 0,
    overflow: 'hidden',
    flexGrow: 1
});
export const Leaves = ({ children }) => (
    <div css={ [root,openCss]}>
        {children}
    </div>
)

Leaves.propTypes = {
    children: PropTypes.node,
    open: PropTypes.bool,
}