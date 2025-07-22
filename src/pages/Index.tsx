
import BudgetApp from '@/components/BudgetApp';
import ErrorBoundary from '@/components/ErrorBoundary';

const Index = () => {
  console.log('Index page rendering...');
  return (
    <ErrorBoundary>
      <BudgetApp />
    </ErrorBoundary>
  );
};

export default Index;
