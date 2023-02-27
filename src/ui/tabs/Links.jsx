import * as React from 'react';
import { 
    Link,  
    useMatch,
    useResolvedPath 
} from "react-router-dom";
import { css } from '@emotion/react';

const activeStyle = (match)=>css({
    padding: '16px',
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
    return(
        <div>
            <nav>
                <ul>
                { 
                    options.map( (option,i) =>{
                        return(
                            <CustomLink
                                key = { `route-${option?.path}-${option.label}-${i}` }
                                to={ option?.path }
                                label = { option?.label } 
                            />
                        )
                    })
                }
                </ul>
            </nav>
        </div>
    )
}

export default NavTabs;
