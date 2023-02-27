import { createContext, useContext} from 'react';
/**
 * User context
 */
export const UserContext = createContext({
    user:{},
    isAdmin: false,
    canResubmit: false  
});

export const useUser= ()=>useContext(UserContext);