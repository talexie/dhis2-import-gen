import { CircularLoader } from '@dhis2-ui/loader'
import React from 'react'

export const RootLoading = () => (
    <div>
        <CircularLoader small />

        <style jsx>{`
            div {
                display: flex;
                justify-content: center;
            }
        `}</style>
    </div>
)

