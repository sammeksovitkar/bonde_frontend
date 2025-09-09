// src/utils/exportToExcel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const exportToExcel = (data, fileName) => {
    // 1. Map the data to a more user-friendly format for the spreadsheet
    const excelData = data.map(student => ({
        'Student ID': student.sitNo,
        'Name': student.name,
        'Class': student.className,
        'Fees Amount': student.feesForMonth?.value,
        'Fees Paid': student.feesForMonth?.paid > 0 ? 'Yes' : 'No'
    }));

    // 2. Create a new workbook and add a new sheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'FeeDetails');

    // 3. Write the workbook to a binary Excel file format
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // 4. Create a Blob from the binary data and trigger the download
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, `${fileName}.xlsx`);
};

export default exportToExcel;