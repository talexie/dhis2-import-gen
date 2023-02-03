import React from 'react';
import { Leaves } from './Leaves';
import { Spacer } from './Spacer';
import { Toggle } from './Toggle';
import { css } from '@emotion/react';

const rootCss =css({
    display: 'flex'
});
export const LabelNode = ({
    open,
    component: label,
    children,
    icon,
    onOpen,
    onClose
}) => {
    const hasLeaves = !!React.Children.toArray(children).filter((i) => i).length
    const showArrow = !icon && hasLeaves
    const showSpacer = !icon && !hasLeaves

    return (
        <div css={ rootCss }>
            {icon && <div>{icon}</div>}
            {showArrow && (
                <Toggle
                    open={open}
                    onOpen={onOpen}
                    onClose={onClose}
                />
            )}

            {showSpacer && <Spacer />}

            <div>
                <div>{label}</div>
                <Leaves open={open} >
                    {children}
                </Leaves>
            </div>
        </div>
    )
}
/*
LabelNode.propTypes = {
    /** Content below this level of the hierarchy; children are revealed when this leaf is 'open' */
    //children: PropTypes.node,
    /** Content/label for this leaf, for example a checkbox */
    //component: PropTypes.element,
    /** A custom icon to use instead of a toggle arrow */
    /*icon: PropTypes.node,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
}
*/
