import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateTransactionPDF = (transactions, filters) => {
  const doc = new jsPDF();
  const primaryColor = [99, 102, 241]; 

  let totalIncome = 0;
  let totalExpense = 0;
  
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else if (t.type === 'expense') totalExpense += t.amount;
  });
  
  const netBalance = totalIncome - totalExpense;
  const currency = transactions.length > 0 ? transactions[0].currency : 'INR';

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('FinTrack Financial Report', 14, 25);

  doc.setFontSize(10);
  let dateText = 'All Time';
  if (filters.startDate && filters.endDate) {
    dateText = `${filters.startDate} to ${filters.endDate}`;
  } else if (filters.startDate) {
    dateText = `From ${filters.startDate}`;
  } else if (filters.endDate) {
    dateText = `Until ${filters.endDate}`;
  }
  doc.text(`Period: ${dateText}`, 14, 32);

  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, doc.internal.pageSize.width - 60, 25);

  const drawCard = (x, y, title, value, color) => {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y, 55, 25, 3, 3, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(title, x + 5, y + 8);
    
    doc.setTextColor(...color);
    doc.setFontSize(14);
    
    const sign = (title === 'Net Balance' && value < 0) ? '-' : '';
    doc.text(`${sign}${currency} ${Math.abs(value).toFixed(2)}`, x + 5, y + 18);
  };

  drawCard(14, 45, 'Total Income', totalIncome, [34, 197, 94]); 
  drawCard(75, 45, 'Total Expense', totalExpense, [239, 68, 68]); 
  drawCard(136, 45, 'Net Balance', netBalance, netBalance >= 0 ? [34, 197, 94] : [239, 68, 68]); 

  const tableColumn = ["Date", "Category", "Type", "Amount", "Payment", "Note"];
  const tableRows = [];

  transactions.forEach(t => {
    const transactionData = [
      format(new Date(t.date), 'MMM dd, yyyy'),
      t.category ? t.category.name : 'Other',
      t.type.toUpperCase(),
      `${t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}`,
      (t.paymentMethod || 'cash').replace('_', ' '),
      t.note || '-'
    ];
    tableRows.push(transactionData);
  });

  autoTable(doc, {
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    styles: { fontSize: 9, cellPadding: 4 },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 3) {
        
        if (data.row.raw[2] === 'INCOME') {
          data.cell.styles.textColor = [34, 197, 94]; 
        } else {
          data.cell.styles.textColor = [239, 68, 68]; 
        }
      }
    }
  });

  doc.save(`FinTrack_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
