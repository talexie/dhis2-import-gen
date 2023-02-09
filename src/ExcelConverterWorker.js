import { read, utils } from 'xlsx';

export const createDhis2Import =(file)=>{
    const wb = read(file);
    const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    console.log(data);
    return data;
}

