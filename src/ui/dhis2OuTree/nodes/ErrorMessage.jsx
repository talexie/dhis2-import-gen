import * as React from 'react';
export const ErrorMessage = ({ children }) => (
    <span css={ {
        fontSize: '14px'
    } }>
        {children}
    </span>
)