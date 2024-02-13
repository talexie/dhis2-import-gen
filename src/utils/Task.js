export const categoryTypes =[
 {
    key: 'data',
    importType: 'DATAVALUE_IMPORT',
    label: 'Data'
 }
]

export const allCategories = categoryTypes.map(({ importType })=>importType);