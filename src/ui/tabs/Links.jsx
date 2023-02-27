import * as React from 'react';
import { Link } from "react-router-dom";
import { css } from '@emotion/react';

const activeStyle = css({
    padding: '16px',
    marginTop: '8px'
});

export const NavTabs =({ options })=>{
    return(
        <div>
            <nav>
                <ul>
                { 
                    options.map( (option,i) =>{
                        return(
                            <Link
                                key = { `route-${option?.path}-${option.label}-${i}` }
                                to={ option?.path }
                                css = { activeStyle }
                            >
                                { option?.label } 
                            </Link>
                        )
                    })
                }
                </ul>
            </nav>
        </div>
    )
}

export default NavTabs;