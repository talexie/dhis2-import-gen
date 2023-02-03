import { colors } from '@dhis2/ui-constants';
import { css } from '@emotion/react';
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react';


const styles={
    container: css({
        display: 'flex'
    }),
    spanCss:  css({
        display: 'block'
    }),
    highlighted: css({
        '.highlighted': {
            background: `${colors.teal200}`,
            paddingRight: '4px'
        }
    })
}  
/**
 * @param {Object} props
 * @param {bool} props.highlighted
 * @param {React.Component|React.Component[]} props.children
 * @returns {React.Component}
 */
export const LabelContainer = ({ highlighted, children }) =>{
return (
    <div css={cx(styles.container,{ highlighted })}>
        <span css={ styles.spanCss }>{children}</span>
    </div>
)}

LabelContainer.propTypes = {
    children: PropTypes.node,
    highlighted: PropTypes.bool,
}
