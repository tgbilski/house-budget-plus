import jsPDF from 'jspdf';

interface ExpenseItem {
  id: string;
  label: string;
  amount: number;
}

interface BudgetData {
  ownerName: string;
  monthlyIncome: number;
  expenses: ExpenseItem[];
  additionalExpenses: ExpenseItem[];
  currency: string;
}

export const generateBudgetPDF = (budgetData: BudgetData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Budget Calculator Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Owner/Renter name
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${budgetData.ownerName || 'Not specified'}`, 20, yPosition);
  yPosition += 15;

  // Monthly Income
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Monthly Income: ${budgetData.currency}${budgetData.monthlyIncome.toLocaleString()}`, 20, yPosition);
  yPosition += 20;

  // Expenses Header
  pdf.setFontSize(16);
  pdf.text('Monthly Expenses:', 20, yPosition);
  yPosition += 10;

  // Standard Expenses
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  budgetData.expenses.forEach(expense => {
    if (expense.amount > 0) {
      pdf.text(`${expense.label}: ${budgetData.currency}${expense.amount.toLocaleString()}`, 30, yPosition);
      yPosition += 8;
    }
  });

  // Additional Expenses
  if (budgetData.additionalExpenses.length > 0) {
    yPosition += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Additional Expenses:', 30, yPosition);
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    
    budgetData.additionalExpenses.forEach(expense => {
      if (expense.amount > 0) {
        pdf.text(`${expense.label}: ${budgetData.currency}${expense.amount.toLocaleString()}`, 40, yPosition);
        yPosition += 8;
      }
    });
  }

  // Calculate totals
  const totalExpenses = [...budgetData.expenses, ...budgetData.additionalExpenses]
    .reduce((sum, expense) => sum + expense.amount, 0);
  const netResult = budgetData.monthlyIncome - totalExpenses;

  yPosition += 10;
  
  // Totals
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Expenses: ${budgetData.currency}${totalExpenses.toLocaleString()}`, 20, yPosition);
  yPosition += 10;
  
  // Net result with color coding
  if (netResult >= 0) {
    pdf.setTextColor(0, 128, 0); // Green for positive
    pdf.text(`Net Result: +${budgetData.currency}${netResult.toLocaleString()}`, 20, yPosition);
  } else {
    pdf.setTextColor(255, 0, 0); // Red for negative
    pdf.text(`Net Result: -${budgetData.currency}${Math.abs(netResult).toLocaleString()}`, 20, yPosition);
  }

  // Reset color
  pdf.setTextColor(0, 0, 0);
  
  // Footer
  yPosition += 30;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const filename = `budget-${budgetData.ownerName || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};