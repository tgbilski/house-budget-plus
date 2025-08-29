import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GuidedBudgetFormProps {
  onFormComplete: (data: any) => void;
}

const GuidedBudgetForm: React.FC<GuidedBudgetFormProps> = ({ onFormComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    paycheckAmount: '',
    payFrequency: 'bi-weekly',
    rentOrMortgage: '',
    utilities: '',
    debtPayments: '',
    groceries: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, payFrequency: value }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // Perform calculations and format data for the BudgetCalculator component
    const income = parseFloat(formData.paycheckAmount) || 0;
    let monthlyIncome = income;

    if (formData.payFrequency === 'bi-weekly') {
      monthlyIncome = income * 2;
    } else if (formData.payFrequency === 'weekly') {
      monthlyIncome = income * 4;
    } else if (formData.payFrequency === 'semi-monthly') {
      monthlyIncome = income * 2;
    } else if (formData.payFrequency === 'monthly') {
        monthlyIncome = income;
    }

    const initialData = {
      income: monthlyIncome,
      expenses: {
        'mortgage': parseFloat(formData.rentOrMortgage) || 0,
        'utilities': parseFloat(formData.utilities) || 0,
        // The rest of the expenses are not in the default expenses list in BudgetCalculator.tsx,
        // but we can add them to an object here. If your calculator has a way to accept custom expenses,
        // you would format them here.
      },
      // If we want to add custom fields to the main calculator, they would go here.
      customExpenses: [
        { label: 'Debt Payments', amount: parseFloat(formData.debtPayments) || 0 },
        { label: 'Groceries', amount: parseFloat(formData.groceries) || 0 },
      ]
    };

    onFormComplete(initialData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Step 1: Your Income</h2>
            <Label htmlFor="paycheckAmount">How much do you take home each paycheck?</Label>
            <Input
              id="paycheckAmount"
              name="paycheckAmount"
              type="number"
              value={formData.paycheckAmount}
              onChange={handleChange}
              className="mt-2"
            />
            <Label htmlFor="payFrequency" className="mt-4 block">How often are you paid?</Label>
            <Select onValueChange={handleSelectChange} value={formData.payFrequency}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bi-weekly">Bi-Weekly (twice a month)</SelectItem>
                <SelectItem value="weekly">Weekly (4 times a month)</SelectItem>
                <SelectItem value="semi-monthly">Semi-Monthly (e.g., 1st & 15th)</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleNext} className="mt-6 w-full">Next</Button>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Step 2: Key Expenses</h2>
            <Label htmlFor="rentOrMortgage">How much is your rent or mortgage payment?</Label>
            <Input
              id="rentOrMortgage"
              name="rentOrMortgage"
              type="number"
              value={formData.rentOrMortgage}
              onChange={handleChange}
              className="mt-2"
            />
            <Label htmlFor="utilities" className="mt-4 block">How much do you set aside for utilities?</Label>
            <Input
              id="utilities"
              name="utilities"
              type="number"
              value={formData.utilities}
              onChange={handleChange}
              className="mt-2"
            />
            <Button onClick={handleNext} className="mt-6 w-full">Next</Button>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-xl font-semibold mb-4">Step 3: Other Expenses</h2>
            <Label htmlFor="debtPayments">What are your total monthly debt payments (e.g., student loans, credit cards)?</Label>
            <Input
              id="debtPayments"
              name="debtPayments"
              type="number"
              value={formData.debtPayments}
              onChange={handleChange}
              className="mt-2"
            />
            <Label htmlFor="groceries" className="mt-4 block">How much do you spend on groceries each month?</Label>
            <Input
              id="groceries"
              name="groceries"
              type="number"
              value={formData.groceries}
              onChange={handleChange}
              className="mt-2"
            />
            <Button onClick={handleSubmit} className="mt-6 w-full">Get My Budget!</Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-lg mx-auto">
      {renderStep()}
    </div>
  );
};

export default GuidedBudgetForm;
