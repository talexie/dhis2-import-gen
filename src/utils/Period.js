import { sub,format,subQuarters,startOfQuarter,startOfYear } from 'date-fns';
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

export const generatePeriods=(type)=>{
    let periods = [];
    const today = new Date();
    if(type === 'Quarterly'){
        periods = [0,1,2,3,4,5,6,7,8,9,12].map((q)=>{
            return {
                label:format(subQuarters(startOfQuarter(today),q),'QQQ yyyy'),
                value:format(subQuarters(startOfQuarter(today),q),'yyyyQQQ')
            };
        });
        
    }
    else if(type === 'Monthly'){
        periods =  [0,1,2,3,4,5,6,7,8,9,10,11].map((q)=>{
            return {
                label:format(sub(today,{ years:0,months:q}),'MMMM yyyy'),
                value:format(sub(today,{ years:0,months:q}),'RRRRMM')
            }
        })
    }
    else if(type === 'Yearly'){
        periods =  [0,1,2,3,4,5].map((q)=>{
            return {
                label:format(sub(today,{ years:q }),'yyyy'),
                value:format(sub(today,{ years:q }),'yyyy')
            }
        })
    }
    else if(type === 'FinancialOct'){
        periods =  [0,1,2,3,4,5].map((q)=>{
            return {
                label:`October, ${format(sub(startOfYear(today),{ months:3,years:q }),'yyyy')} - September, ${format(sub(today,{ years:q }),'yyyy')}`,
                value:`${format(sub(startOfYear(today),{ months:3, years:q }),'yyyy')}Oct`
            }
        })
    }
    else if(type === 'FinancialJuly'){
        periods =  [0,1,2,3,4,5].map((q)=>{
            return {
                label:`July, ${format(sub(startOfYear(today),{ months:6,years:q }),'yyyy')} - June, ${format(sub(today,{ years:q }),'yyyy')}`,
                value:`${format(sub(startOfYear(today),{ months:6,years:q }),'yyyy')}July`
            }
        })
    }
    else if(type === 'SixMonthlyOct'){
        //2020AprilS2: Oct-Mar,2020 , 2021AprilS1 : Apr -Sep 2021 
        const sixMonthlyOctPeriods = [0,1,2,3,4,5].map((q)=>{
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
        periods = sixMonthlyOctPeriods?.reduce((acc,p)=>[...acc,...p]);
    }
    else{

    }
    return orderBy(periods,['label'],['desc']);
}