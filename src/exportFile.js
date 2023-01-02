import XLSX from 'xlsx';

const input_data = [
    {
      "id": "tagID1", 
      "error": { "code": 0, "success": true }, 
      "data": [
        [1604395417575, 108, 3], 
        [1604395421453, 879, 3]
      ]
    },
    {
      "id": "tagID2", 
      "error": {"code": 0, "success": true}, 
      "data": [
        [1604395417575, 508, 3], 
        [1604395421453, 179, 3]
      ]
    }
  ];
  
  // data transforms
  // 1st transform - get long array of objects
  const prep = input_data.map(obj => {
    return obj.data.map(arr => {
      return {
        "TimeStamp": arr[0],
        "id": obj.id,
        "order": +obj.id.substr(5, obj.id.length - 5),
        "quality": arr[1],
        "value": arr[2]
      }
    });
  }).flat();
  
  // sort by timestamp asc, order asc
  prep.sort((a, b) => a.TimeStamp - b.TimeStamp || a.order - b.order);
  
  // headers
  // const headers = ["Timestamp"].concat(
  //   [...new Set(prep.map(obj => obj.id))]
  //     .map(id => [`${id} quality`, `${id} value`])
  //     .flat()
  // );
  const ids = [...new Set(prep.map(obj => obj.id))];
  //console.log("Ids:",ids)
  const headers1 = [""].concat(ids.map(id => Array(2).fill(id)).flat());
  const headers2 = ["Timestamp"].concat(ids.map(id => Array(["quality", "value"])).flat()).flat();
  //console.log("H1:",headers1);
  //console.log("H2:",headers2)
  // organise the data - in wide format
  
  const ws_data = [...new Set(prep.map(obj => obj.TimeStamp))]
    .map(ts => {
      const objByTimestamp = prep.filter(obj => obj.TimeStamp === ts);
      let arr = [ts];
      objByTimestamp.forEach(obj => arr = arr.concat([obj.quality, obj.value]));
      return arr;
    });
  // prepend the headers
  ws_data.unshift(headers2);
  ws_data.unshift(headers1);
  // to Excel
  // new workbook
  const wb = XLSX.utils.book_new();
  
  // create sheet with array-of-arrays to sheet method
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
  // assign sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  // set column A as text
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let i = range.s.r; i <= range.e.r; i++) {
    const ref = XLSX.utils.encode_cell({r: i , c: 0});
    ws[ref].z = "0";
  }
  
  // assign merges to sheet
  // https://stackoverflow.com/questions/53516403/sheetjs-xlsx-how-to-write-merged-cells
  const merges = ids.reduce((acc, curr, idx) => {
    acc.push({
      s: {r: 0, c: 1 + (2 *idx)},
      e: {r: 0, c: 1 + (2 *idx) + 1}
    });
    return acc;
  }, []);
  ws["!merges"] = merges;
  export const exportCsv =()=>{
    return XLSX.writeFile(wb, 'testfile.xlsx', { bookType:'xlsx', bookSST:false, type:'binary' });
  }
  