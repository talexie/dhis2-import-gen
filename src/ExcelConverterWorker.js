import { read, utils } from 'xlsx';
import { get } from 'lodash';
import { nativeMerge, nativeRenameLabels } from './utils';

export const createDhis2Import =(file)=>{
    const wb = read(file);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const dataWs = getMergeValue(ws);
    const data = utils.sheet_to_json(dataWs, { header: "A"});
    const tblData = utils.sheet_to_html(ws);
    return {
        data: data,
        table: tblData
    }
}
export const rangeContainsAddr=(range, addr)=> { 
    if(typeof addr == "string") addr = utils.decode_cell(addr);
    if(typeof range == "string") range = utils.decode_range(range);
    return range.s.r <= addr.r && range.s.c <= addr.c && range.e.c >= addr.c && range.e.r >= addr.r;
}
export const getCellObject =(ws,target_cell)=>{
    var merge = ws["!merges"].find((merge)=>{ 
        return rangeContainsAddr(merge, target_cell); 
    });
    
    var actual_address = merge ? merge.s : target_cell; // the actual address of the cell object
    
    var base_cell = ws[utils.encode_cell(actual_address)]; // cell object
    return base_cell;
}
/**
 * Merge by column
 * @param {*} ws 
 * @param {*} col 
 * @returns 
 */
export const getMergeValue =(ws,col=1)=>{
    let temp = "";
    const m = utils.decode_range(ws['!ref']);
    for(let r=m.s.r;r<=m.e.r;r++){
        const v = ws[utils.encode_cell({ c:col,r:r})];
        if(v){
            temp = v;
        }
        else{
            ws[utils.encode_cell({ c:col,r:r})] = temp;
        }
    }
    return ws;
}

/**
   * Fill cell from a Worksheet that was merged
   * @param {WorkSheet} ws -Worksheet that will be filled
   */
export const fillMerges=(ws)=>{
    const merges = ws['!merges'];
    const mergesMap = merges?.map((merge) => ({
      start: utils.encode_cell(merge?.s),
      end: utils.encode_cell(merge?.e),
    }));

    // console.log(JSON.stringify(mergesMap, undefined, 2));

    for (const merge of mergesMap) {
      const cells = getCellsForHorizontalRange(merge);
      if (ws[merge?.start]) {
        const cellValue = get(ws, merge?.start);
        for (const newCell of cells) {
          ws[newCell] = cellValue;
        }
      }
    }
    return ws;
}
/**
   * Compute the next column name for a xls file
   * @example
   * // returns B
   * getNextColumn('A');
   * @example
   * // returns AA
   * getNextColumn('Z');
   * @param {String} column - Xls file column name
   * @returns next column name
   */
export const getNextColumn=(column)=> {
    let nextColumn = column.substring(0, column.length - 1) + String.fromCharCode(column.charCodeAt(column.length - 1) + 1);
    // next char after 'Z'
    if (nextColumn[nextColumn.length - 1] === '[') {
      const arr = nextColumn.split('');
      arr.pop();
      nextColumn = arr.join().concat('AA');
    }

    return nextColumn;
  }

  /**
   * Create a array of cell names in the same row based on range of merged cells
   * @param merge - A range of merged cells
   * @returns {string[]} Array of cell names
   */
export const getCellsForHorizontalRange=(merge)=> {
    const row = merge.start.match(/\d+/)[0];
    const startCol = merge.start.match(/[A-Z]{1,2}/)[0];
    const endCol = merge.end.match(/[A-Z]{1,2}/)[0];
    const cells = [merge.start];
    if (startCol.localeCompare(endCol) === 0) return cells;

    let nextColumn =getNextColumn(startCol);
    while (nextColumn.localeCompare(endCol) === -1) {
      cells.push(nextColumn + row);
      nextColumn = getNextColumn(nextColumn);
    }
    cells.push(endCol + row);

    return cells;
}

/**
 * Create DHIS2 Payload
 * @param {*} data 
 * @param {*} period 
 * @param {*} orgUnit 
 * @param {*} aoc 
 * @returns 
 */
export const createDhis2Payload=(data,mapping,period,orgUnit,aoc,isLegacy=false)=>{
    const renameKeys = isLegacy?
    [
        {
            old:"B",
            new: "SMARTCAREIndicator"
        },
        {
            old:"C",
            new: "SMARTCAREIndicatorLegacyLabel"
        }
    ]:[
        {
            old:"B",
            new: "SMARTCAREIndicator"
        },
        {
            old:"C",
            new: "SMARTCAREIndicatorLabel"
        }
    ]
    const renamedData = nativeRenameLabels(data,renameKeys);
    const mergeKeys = isLegacy?['SMARTCAREIndicator','SMARTCAREIndicatorLegacyLabel']:['SMARTCAREIndicator','SMARTCAREIndicatorLabel']
    const mergedData = nativeMerge(renamedData,mapping,mergeKeys);
    const renameMergedData = nativeRenameLabels(mergedData,[
        {
            old:"F",
            new: "value"
        },
        {
            old:"ECHODataElementUID",
            new: "dataElement"
        },
        {
            old:"ECHOCategoryOptionComboUID",
            new: "categoryOptionCombo"
        }
    ]);
    const filteredData = renameMergedData?.filter((f)=>Object.hasOwn(f,'dataElement') && Object.hasOwn(f,'categoryOptionCombo') && get(f,'dataElement') && get(f,'categoryOptionCombo') && (get(f,'value') > 0));
    return filteredData?.map((d)=>{
        return {
            orgUnit : orgUnit,
            period :period,
            attributeOptionCombo: aoc,
            value: d?.['value'],
            dataElement: d?.['dataElement'],
            categoryOptionCombo: d?.['categoryOptionCombo']
        }
    })
}