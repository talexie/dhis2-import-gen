import * as React from 'react';
import { css } from '@emotion/react';
import { CircularProgress } from '@mui/material';

const loader = css({
    display: 'flex',
    justifyContent: 'center'
});

export const RootLoading = () => (
    <div css={ loader }>
        <CircularProgress 
            disableShrink
            size={ 20 }
        />
    </div>
)