import * as Excel from 'exceljs';
import { saveAs } from 'file-saver';

const createHeader = (keys: any) => {
  const result: any[] = [];
  keys.map((keyData: any) => {
    if (keyData.children) {
      keyData.children.map((childData: any) => {
        result.push({
          key: childData.dataIndex,
          width: 20,
        });
      });
    } else {
      if (keyData.dataIndex !== 'operation') {
        result.push({
          key: keyData.dataIndex,
          width: 20,
        });
      }
    }
  });
  return result;
};
const createThaiHeader = (keys: any) => {
  const result: any[] = [];
  const Obj = {};
  keys.map((keyData: any) => {
    const Obj2 = {};
    if (keyData.children) {
      Object.assign(Obj, { [keyData.dataIndex]: keyData.title });
      keyData.children.map((childData: any) => {
        Object.assign(Obj, { [childData.dataIndex]: childData.title });
        Object.assign(Obj2, { [childData.dataIndex]: childData.title });
      });
      Object.assign(Obj, {
        [keyData.dataIndex]: {
          [keyData.children[0].dataIndex]: keyData.title,
          children: Obj2,
        },
      });
    } else {
      Object.assign(Obj, { [keyData.dataIndex]: keyData.title });
    }
  });
  result.push(Obj);
  return result;
};
const createSubheader = (
  ws: Excel.Worksheet,
  headers: object[],
  CellName: string[]
) => {
  const storeChildren: any[] = [];
  const storeSubChildren: any[] = [];
  const storeChildrenLength: number[] = [];
  const storeKeyInTable: any[] = [];
  const headerData: any = {};

  headers.map((da: any) => {
    const headerKeys = Object.keys(da);
    headerKeys.map(k => {
      if (da[k].children) {
        const childKey = Object.keys(da[k])[0];
        storeChildren.push({ [childKey]: da[k][childKey] });
        storeSubChildren.push(da[k].children);
        storeChildrenLength.push(Object.keys(da[k].children).length);
      }
    });
  });

  const startKeyBeforeMerge = storeChildren.map(s => {
    // merge cell จากหัวข้อเริ่มต้น
    const childKey = Object.keys(s)[0];
    const childVal = Object.values(s)[0];
    Object.assign(headerData, { [childKey]: childVal });
    return childKey;
  });

  storeSubChildren.map(s => {
    const childKey = Object.keys(s);
    childKey.map((key: any) => {
      storeKeyInTable.push(key);
    });
    return childKey;
  });

  CellName.map((name: any, index: number) => {
    ws.mergeCells(name + ':' + name.slice(0, name.length - 1) + '6');
  });

  storeKeyInTable.map(key => {
    // move value to row 6
    const idCol = ws.getColumn(key);
    if (idCol.number !== undefined) {
      const colAddress = ws.getRow(5).getCell(idCol.number).address;
      ws.unMergeCells(colAddress);
      CellName.map((name: any) => {
        ws.getCell(name.slice(0, name.length - 1) + '6').value = ws.getCell(
          name
        ).value;
      });
    }
  });

  startKeyBeforeMerge.map((startKey: any, index: number) => {
    // merge cell of header
    const idCol = ws.getColumn(startKey);
    if (idCol.number !== undefined) {
      const colAddress = ws.getRow(5).getCell(idCol.number).address;
      const startCol = Number.parseInt(
        ws.getRow(5).getCell(idCol.number).col,
        10
      );
      const endCol =
        Number.parseInt(ws.getRow(5).getCell(idCol.number).col, 10) +
        storeChildrenLength[index] -
        1;
      ws.getCell(colAddress).value = headerData[startKey];
      ws.mergeCells(5, startCol, 5, endCol);
    }
  });
  return ws;
};

export const generateExcel = async (column: any, name: string, data: any) => {
  const headers = createHeader(column);
  const thaiHeaders = createThaiHeader(column);
  const storeCellName: string[] = [];
  const blobType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const workbook = new Excel.Workbook();
  const ws = workbook.addWorksheet(name, {
    pageSetup: { fitToPage: true, orientation: 'landscape', paperSize: 9 },
  });
  const lastColumnGreater26 = ws.getCell(1, headers.length).address.slice(0, 2);
  const lastColumnLess26 = ws.getCell(1, headers.length).address.slice(0, 1);
  if (headers.length <= 26) {
    ws.mergeCells('A1:' + lastColumnLess26 + '2');
  } else {
    ws.mergeCells('A1:' + lastColumnGreater26 + '2');
  }
  ws.getCell('A1').value = name;
  ws.columns = headers;
  ws.addRow([]);
  ws.addRow([]);
  ws.addRows(thaiHeaders);
  ws.eachRow(row => {
    row.eachCell(cell => {
      if (cell.address.slice(-1) === '5') {
        storeCellName.push(cell.address);
      }
    });
  });

  const updateSubheaderWs = createSubheader(ws, thaiHeaders, storeCellName);

  updateSubheaderWs.addRows(data);
  updateSubheaderWs.eachRow(row => {
    row.eachCell(cell => {
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
      cell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' },
      };
    });
  });

  updateSubheaderWs.getCell('A1').border = {
    top: { style: undefined },
    left: { style: undefined },
    bottom: { style: undefined },
    right: { style: undefined },
  };
  updateSubheaderWs.getCell('A1').font = {
    size: 14,
    bold: true,
  };
  await workbook.xlsx.writeBuffer().then(data => {
    const blob = new Blob([data], { type: blobType });
    saveAs(blob, name + '.xlsx');
  });
};
