const xlsx = require("node-xlsx"); //引入模块

const exportExcels = (data) => {
  // 設置表格列寬
  const options = {
    "!cols": [
      { wch: 25 },
      { wch: 45 },
      { wch: 90 },
      { wch: 20 },
      { wch: 20 },
      { wch: 90 },
    ],
  };
  let xlsxObj = [
    {
      name: "sheet",
      data:data
    }
  ]
  console.log(xlsxObj,data)
  return xlsx.build(xlsxObj, options)
};

module.exports = exportExcels;
