import PropTypes from 'prop-types'
import React from 'react';

export const RootError = ({  error }) => (
    <div>
        Error occured: { error }
    </div>
)


RootError.propTypes = {
    error: PropTypes.string.isRequired,
}
