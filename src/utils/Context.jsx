import { createContext, useContext} from 'react';
/**
 * User context
 */
export const UserContext = createContext({
    user:{},
    isAdmin: false,
    canResubmit: false,
    hasAccess: false,
    restricted: false  
});

export const useUser= ()=>useContext(UserContext);