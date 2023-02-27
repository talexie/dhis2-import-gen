import { useQuery } from "react-query";

/**
 * Get User Hook
 * @returns 
 */
export const useCurrentUser = ()=>{
    const { data, isLoading } = useQuery({
        queryKey:[`me?fields=id,username,userGroups[id,name,code]`],
        refetchOnWindowFocus: false
    });
    return {
        loading: isLoading,
        data: data
    }
}
/**
 * Check if user has belongs to the User Group
 * @param {*} groups 
 * @param {*} userGroup 
 * @returns 
 */
export const hasUserGroup = (groups,userGroup)=>{
    return groups?.some((g)=>g?.code?.toUpperCase() === userGroup?.toUpperCase() || g?.name?.toUpperCase() === userGroup?.toUpperCase());
}
/**
 * Test if user has a usergroup
 * @param {*} groups 
 * @param {*} userGroup 
 * @returns 
 */
export const getUserGroup = (groups, userGroup)=>{
    const testGroups = groups?.map((g)=>g?.code?.toUpperCase());
    return testGroups?.indexOf(userGroup?.toUpperCase()) > -1;
}