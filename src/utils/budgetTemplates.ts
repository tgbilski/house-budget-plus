interface TemplateData {
  defaultIncome: number;
  fixedExpenses: Record<string, number>;
  additionalExpenses: Array<{ label: string; amount: number }>;
}

export const budgetTemplateData: Record<string, TemplateData> = {
  'college-student': {
    defaultIncome: 1500,
    fixedExpenses: {
      'mortgage': 800, // Dorm/apartment rent
      'electric': 40,
      'gas': 20,
      'water': 25,
      'internet': 50,
      'phone': 45,
      'car-insurance': 120,
    },
    additionalExpenses: [
      { label: 'Tuition/Books', amount: 300 },
      { label: 'Food/Dining', amount: 250 },
      { label: 'Transportation', amount: 80 },
      { label: 'Entertainment/Social', amount: 150 },
      { label: 'Laundry/Personal Care', amount: 50 },
    ]
  },
  'young-professional': {
    defaultIncome: 4500,
    fixedExpenses: {
      'mortgage': 1400,
      'electric': 80,
      'gas': 50,
      'water': 45,
      'sewage': 30,
      'utilities': 40,
      'car-loan': 350,
      'car-insurance': 150,
      'internet': 70,
      'phone': 65,
    },
    additionalExpenses: [
      { label: 'Student Loans', amount: 400 },
      { label: 'Career Development', amount: 200 },
      { label: 'Emergency Fund', amount: 450 },
      { label: '401k Contribution', amount: 550 },
      { label: 'Health Insurance', amount: 200 },
      { label: 'Groceries', amount: 350 },
      { label: 'Dining Out', amount: 250 },
    ]
  },
  'family-budget': {
    defaultIncome: 8000,
    fixedExpenses: {
      'mortgage': 2200,
      'electric': 150,
      'gas': 80,
      'water': 65,
      'sewage': 45,
      'utilities': 60,
      'car-loan': 500,
      'car-insurance': 200,
      'internet': 80,
      'phone': 120, // Family plan
    },
    additionalExpenses: [
      { label: 'Childcare', amount: 1200 },
      { label: 'Health Insurance', amount: 450 },
      { label: 'Groceries', amount: 600 },
      { label: 'Children Activities', amount: 300 },
      { label: 'Education Savings', amount: 400 },
      { label: 'Family Entertainment', amount: 200 },
      { label: 'Clothing', amount: 150 },
    ]
  },
  'new-parents': {
    defaultIncome: 6500,
    fixedExpenses: {
      'mortgage': 1800,
      'electric': 120,
      'gas': 60,
      'water': 55,
      'sewage': 35,
      'utilities': 50,
      'car-loan': 400,
      'car-insurance': 180,
      'internet': 75,
      'phone': 100,
    },
    additionalExpenses: [
      { label: 'Baby Supplies/Diapers', amount: 200 },
      { label: 'Childcare', amount: 800 },
      { label: 'Health Insurance', amount: 400 },
      { label: 'Baby Food', amount: 100 },
      { label: 'Pediatric Care', amount: 150 },
      { label: 'College Savings', amount: 200 },
      { label: 'Groceries', amount: 450 },
      { label: 'Baby Gear/Clothing', amount: 150 },
    ]
  },
  'first-time-homebuyer': {
    defaultIncome: 5500,
    fixedExpenses: {
      'mortgage': 0, // Currently renting
      'electric': 90,
      'gas': 45,
      'water': 40,
      'sewage': 25,
      'utilities': 35,
      'car-loan': 300,
      'car-insurance': 140,
      'internet': 65,
      'phone': 70,
    },
    additionalExpenses: [
      { label: 'Current Rent', amount: 1200 },
      { label: 'Down Payment Savings', amount: 800 },
      { label: 'Home Inspection Fund', amount: 100 },
      { label: 'Moving Fund', amount: 150 },
      { label: 'Closing Costs Fund', amount: 200 },
      { label: 'Home Maintenance Fund', amount: 150 },
      { label: 'Groceries', amount: 350 },
    ]
  },
  'wedding-planning': {
    defaultIncome: 5000,
    fixedExpenses: {
      'mortgage': 1300,
      'electric': 85,
      'gas': 50,
      'water': 45,
      'sewage': 30,
      'utilities': 40,
      'car-loan': 280,
      'car-insurance': 160,
      'internet': 70,
      'phone': 90,
    },
    additionalExpenses: [
      { label: 'Wedding Venue', amount: 400 },
      { label: 'Wedding Catering', amount: 350 },
      { label: 'Wedding Photography', amount: 200 },
      { label: 'Wedding Attire', amount: 100 },
      { label: 'Wedding Flowers', amount: 80 },
      { label: 'Honeymoon Fund', amount: 300 },
      { label: 'Groceries', amount: 300 },
    ]
  },
  'travel-enthusiast': {
    defaultIncome: 5000,
    fixedExpenses: {
      'mortgage': 1100,
      'electric': 70,
      'gas': 40,
      'water': 35,
      'sewage': 25,
      'utilities': 30,
      'car-loan': 250,
      'car-insurance': 120,
      'internet': 80,
      'phone': 60,
    },
    additionalExpenses: [
      { label: 'Travel Fund', amount: 600 },
      { label: 'Flight Savings', amount: 300 },
      { label: 'Accommodation Fund', amount: 250 },
      { label: 'Travel Insurance', amount: 50 },
      { label: 'Travel Gear', amount: 100 },
      { label: 'Emergency Travel Fund', amount: 200 },
      { label: 'Groceries', amount: 280 },
    ]
  }
};

export const getTemplateData = (templateId: string): TemplateData | null => {
  return budgetTemplateData[templateId] || null;
};