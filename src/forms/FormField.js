import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
    container: {
        marginBottom: 15
    },
    label: {
        display: 'block',
        color: '#000',
        fontSize: '13',
        fontWeight: 600,
        textTransform: 'uppercase',
        margin: '0 0 10px'
    }
});

const FormField = ({ dataTest, label, required = false, children }) => {
    const classes = useStyles();
    return (
        <div className={classes.container} data-test={dataTest}>
            <span className={classes.label}>
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