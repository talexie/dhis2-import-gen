import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/react';

const classes={
    container:  css({
        marginBottom: 15
    }),
    label:  css({
        display: 'block',
        color: '#000',
        fontSize: '13',
        fontWeight: 600,
        textTransform: 'uppercase',
        margin: '0 0 10px'
    })
};

const FormField = ({ dataTest, label, required = false, children }) => {
    return (
        <div css={classes.container} data-test={dataTest}>
            <span css={classes.label}>
                {label}
                {required && <span> *</span>}
            </span>
            {children}
        </div>
    )
}

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
    required: PropTypes.bool,
}

export { FormField }