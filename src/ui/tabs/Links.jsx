import * as React from 'react';
import { 
    Link,  
    useMatch,
    useResolvedPath 
} from "react-router-dom";
import { css } from '@emotion/react';
import { useUser } from '../../utils';
import { Stack } from '@mui/material';

const navroot =css({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    width: '100vw',
    zIndex: 1
});
const navul =css({
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '6px',
    listStyle: 'none',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    margin: 0
});
const navlink =css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2px',
    all: 'unset',
    padding: '8px 12px',
    outline: 'none',
    userSelect: 'none',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: '4px',
    fontSize: '15px',
    color: '#6550b9'
});
const activeStyle = (match)=>css({
    marginTop: '8px',
    textDecoration: match ? "underline" : "none"
});

export const CustomLink = ({ children, label, to, ...props }) => {
    let resolved = useResolvedPath(to);
    let match = useMatch({ path: resolved?.pathname, end: true });
    return (
        <Link
          css = { activeStyle(match) }
          to={to}
          {...props}
        >
            { label  }
            {children}
        </Link> 
    );
}

export const NavTabs =({ options })=>{
    const userRestricted = useUser();
    const restrictedTabs = options?.filter((o)=>o?.userGroup === 'RESTRICTED_APP_ACCESS');
    const tabs = userRestricted?.restricted && !userRestricted?.isAdmin?restrictedTabs:options;
    return(
        <Stack spacing={2}>
            { 
                tabs?.map( (option,i) =>{
                    return(
                        <li key={`nav-${i}`} css={ navlink }>
                            <CustomLink
                                key = { `route-${option?.path}-${option.label}-${i}` }
                                to={ option?.path }
                                label = { option?.label } 
                            />
                        </li>
                    )
                })
            }
        </Stack>
    )
}

export default NavTabs;
