import * as  React from 'react';
import { css } from '@emotion/react';

const root =css({
    width: '24px',
    position: 'relative',
    flexShrink: 0,
    ':after': {
        height: 'calc(100% - 24px)',
        left: '12px',
        position: 'absolute',
        top: '15px',
        width: '1px',
        zIndex: '1',
    },
    '.open:after': {
        content: '""'
    },
    ':global(svg)': {
        verticalAlign: 'top',
        transform: 'rotate(-90deg)'
    },
    '.open :global(svg)': {
        transform: 'rotate(0)'
    }
});

const spanCss = css({
    display: 'block',
    position: 'relative',
    zIndex: 2
});
const svgCss = css({
    fill: 'inherit',
    height: '24px',
    width: '24px',
    verticalAlign: 'middle',
    pointerEvents: 'none'
});
const ArrowDown = () => (
    <svg css={svgCss} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path d="M14 20l10 10 10-10z" />
        
    </svg>
)

export const Toggle = ({ open, onOpen, onClose } ) => {
    const onClick = open ? onClose : onOpen

    return (
        <div
            css ={ root }
            onClick={(event) => onClick && onClick({ open: !open }, event)}
        >
            <span css={ spanCss }>
                <ArrowDown />
            </span>
        </div>
    )
}
/*
Toggle.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
}
*/