import { CircularLoader } from '@dhis2/ui'
import React from 'react'
import { css } from '@emotion/react';

const styles={
    extrasmall: css({
        display: 'block',
        margin: '3px 0'
    })
};

export const LoadingSpinner = () =>{
    return (
        <div>
            <CircularLoader css={styles.extraSmall} />
            <style jsx>{`
                div {
                    width: 24px;
                }
            `}</style>
        </div>
    )
}
