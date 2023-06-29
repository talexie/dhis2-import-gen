import { sub,format,subQuarters,startOfQuarter,startOfYear, endOfQuarter } from 'date-fns';
import orderBy from 'lodash/orderBy';
export const periodTypes = [
    {
        "label":"Quarterly",
        "value":"Quarterly"
    },
    {
        "label":"Monthly",
        "value":"Monthly"
    },
    {
        "label":"Yearly",
        "value":"Yearly"
    },
    {
        "label":"Weekly",
        "value":"Weekly"
    },
    {
        "label":"FinancialOct",
        "value":"FinancialOct"
    },
    {
        "label":"FinancialJuly",
        "value":"FinancialJuly"
    },
    {
        "label":"SixMonthlyOct",
        "value":"SixMonthlyOct"
    }
];
/**
 * Generate Period Types
 * @param {*} pe 
 * @returns 
 */
export const getPeriodTypes =(pe=[])=>{
    return periodTypes?.filter((p)=>{
        return pe?.some((pt)=> pt?.toUpperCase() === p?.value?.toUpperCase());
    });
}
/**
 * Period Generator by Type
 * @param {*} type 
 * @returns 
 */
export const generatePeriods=(type,latest=false)=>{
    let periods = [];
    const today = new Date();
    if(type === 'Quarterly'){
        if(latest){
            periods =[1].map((q)=>{
                const squarter = subQuarters(startOfQuarter(today),q);
                const endsQuarter = subQuarters(endOfQuarter(today),q);
                return {
                    label:`${format(squarter,'MMM yyyy')}-${format(endsQuarter,'MMM yyyy')}`,
                    value:format(squarter,'yyyyQQQ')
                };
            });
        }
        else {
            periods = [1,2,3,4,5,6,7,8,9,12].map((q)=>{
                const quarter = subQuarters(startOfQuarter(today),q);
                const endQuarter = subQuarters(endOfQuarter(today),q);
                return {
                    label:`${format(quarter,'MMM yyyy')}-${format(endQuarter,'MMM yyyy')}`,
                    value:format(quarter,'yyyyQQQ')
                };
            });
        }
    }
    else if(type === 'Monthly'){
        if(latest){
            periods =[1].map((q)=>({
                label:format(sub(today,{ years:0,months:q}),'MMMM yyyy'),
                value:format(sub(today,{ years:0,months:q}),'RRRRMM')
            }));
        }
        else {
            periods =  [0,1,2,3,4,5,6,7,8,9,10,11].map((q)=>{
                
                return {
                    label:format(sub(today,{ years:0,months:q}),'MMMM yyyy'),
                    value:format(sub(today,{ years:0,months:q}),'RRRRMM')
                }
            })
        }
    }
    else if(type === 'Yearly'){
        if(latest){
            periods =[1].map((q)=>({
                label:format(sub(today,{ years:q }),'yyyy'),
                value:format(sub(today,{ years:q }),'yyyy')
            }));
        }
        else {
            periods =  [0,1,2,3,4,5].map((q)=>{
                return {
                    label:format(sub(today,{ years:q }),'yyyy'),
                    value:format(sub(today,{ years:q }),'yyyy')
                }
            })
        }
    }
    else if(type === 'FinancialOct'){
        if(latest){
            periods =[1].map((q)=>({
                label:`October, ${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')} - September, ${format(sub(today,{ years:q }),'yyyy')}`,
                value:`${format(sub(startOfYear(today),{ months:3, years:q }),'yyyy')}Oct`
            }));
        }
        else {
            periods =  [0,1,2,3,4,5].map((q)=>{
                return {
                    label:`October, ${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')} - September, ${format(sub(today,{ years:q }),'yyyy')}`,
                    value:`${format(sub(startOfYear(today),{ months:3, years:q }),'yyyy')}Oct`
                }
            })
        }
    }
    else if(type === 'FinancialJuly'){
        if(latest){
            periods =[1].map((q)=>({
                label:`July, ${format(sub(startOfYear(today),{ months:6,years:q }),'yyyy')} - June, ${format(sub(today,{ years:q }),'yyyy')}`,
                value:`${format(sub(startOfYear(today),{ months:6,years:q }),'yyyy')}July`
            }));
        }
        else {
            periods =  [0,1,2,3,4,5].map((q)=>{
                return {
                    label:`July, ${format(sub(startOfYear(today),{ months:6,years:q }),'yyyy')} - June, ${format(sub(today,{ years:q }),'yyyy')}`,
                    value:`${format(sub(startOfYear(today),{ months:6,years:q }),'yyyy')}July`
                }
            })
        }
    }
    else if(type === 'SixMonthlyOct'){
        let sixMonthlyOctPeriods =[];
        if(latest){
            sixMonthlyOctPeriods =[1].map((q)=>{
                return [0,1].map((val)=>{
                    if(val === 0){
                        return {
                            label:`October, ${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')} - March, ${format(sub(today,{ years:q }),'yyyy')}`,
                            value:`${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')}AprilS2`
                        }
                    }
                    else{
                        return {
                            label:`April, ${format(sub(today,{ years:q }),'yyyy')} - September, ${format(sub(today,{ years:q }),'yyyy')}`,
                            value:`${format(sub(today,{ years:q }),'yyyy')}AprilS1`
                        }
                    }
                });
            });
        }
        else {
            //2020AprilS2: Oct-Mar,2020 , 2021AprilS1 : Apr -Sep 2021 
            sixMonthlyOctPeriods = [0,1,2,3,4,5].map((q)=>{
                return [0,1].map((val)=>{
                    if(val === 0){
                        return {
                            label:`October, ${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')} - March, ${format(sub(today,{ years:q }),'yyyy')}`,
                            value:`${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')}AprilS2`
                        }
                    }
                    else{
                        return {
                            label:`April, ${format(sub(today,{ years:q }),'yyyy')} - September, ${format(sub(today,{ years:q }),'yyyy')}`,
                            value:`${format(sub(today,{ years:q }),'yyyy')}AprilS1`
                        }
                    }
                });
            });
        }
        periods = sixMonthlyOctPeriods?.reduce((acc,p)=>[...acc,...p]);
    }
    else{

    }
    return orderBy(periods,['label'],['desc']);
}