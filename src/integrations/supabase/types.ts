import { useState, useEffect } from 'react';

// The import for '@stripe/stripe-js' has been removed as it caused a compilation error.
// The code now dynamically loads the Stripe.js library via a script tag.

const STRIPE_PUBLIC_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

// This is a mock backend function. In a real application, you would
// make a fetch call to your actual server, which would then use the Stripe SDK.
const createCheckoutSession = async (priceId) => {
    // In a real application, this would be a fetch call to your backend.
    // The backend would handle the API call to Stripe to create the session.
    // We are simulating this here for a self-contained example.

    console.log(`Creating checkout session for price ID: ${priceId}`);

    const mockStripeSession = {
        id: `cs_test_${priceId}_123456`,
        url: `https://checkout.stripe.com/c/pay/${priceId}`,
        object: 'checkout.session',
        line_items: [
            {
                price: {
                    id: priceId,
                },
                quantity: 1,
            },
        ],
    };

    return mockStripeSession;
};

// Main App Component
export default function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stripe, setStripe] = useState(null);

    // Replace these with the actual Price IDs from your Stripe Dashboard for each product.
    // The monthly price ID has been updated with the new value you provided.
    const monthlyPriceId = 'price_1RrhWkBrWYpRfa7qG8SWbtWY';
    const annualPriceId = 'price_1RrhqKBrWYpRfa7qNu0fEsf0'; 

    useEffect(() => {
        // Dynamically load the Stripe.js script
        if (window.Stripe) {
            setStripe(window.Stripe(STRIPE_PUBLIC_KEY));
        } else {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            script.onload = () => {
                if (window.Stripe) {
                    setStripe(window.Stripe(STRIPE_PUBLIC_KEY));
                } else {
                    setError('Stripe.js failed to load. Please check your network connection.');
                }
            };
            document.body.appendChild(script);
        }
    }, []);

    // This function now accepts a priceId argument to create the correct session.
    const handleCheckout = async (priceId) => {
        setLoading(true);
        setError(null);
        try {
            if (!stripe) {
                setError('Stripe is not yet loaded. Please wait a moment and try again.');
                setLoading(false);
                return;
            }

            // Call the mock backend to create a Checkout Session for the selected product.
            const session = await createCheckoutSession(priceId);
            
            // Redirect to Stripe Checkout using the session URL.
            window.location.href = session.url;

        } catch (e) {
            console.error(e);
            setError("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-sm w-full text-center space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Premium Calculator</h1>
                <p className="text-gray-600">
                    Get access to all premium features with a one-time purchase.
                </p>
                
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Monthly Subscription Option */}
                    <div className="flex-1 bg-blue-50 rounded-xl p-6 shadow-md border-2 border-transparent hover:border-blue-500 transition-all duration-300">
                        <h2 className="text-2xl font-bold text-blue-800">Monthly Plan</h2>
                        <div className="mt-2 mb-4">
                            <span className="text-4xl font-extrabold text-blue-700">$9.99</span>
                            <span className="text-gray-500 font-medium"> / month</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Price ID: <code className="bg-gray-200 rounded px-1">{monthlyPriceId}</code>
                        </p>
                        <button
                            onClick={() => handleCheckout(monthlyPriceId)}
                            disabled={loading || !stripe}
                            className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {loading ? 'Redirecting...' : 'Purchase Monthly'}
                        </button>
                    </div>

                    {/* Annual Subscription Option */}
                    <div className="flex-1 bg-green-50 rounded-xl p-6 shadow-md border-2 border-transparent hover:border-green-500 transition-all duration-300">
                        <h2 className="text-2xl font-bold text-green-800">Annual Plan</h2>
                        <div className="mt-2 mb-4">
                            <span className="text-4xl font-extrabold text-green-700">$99.99</span>
                            <span className="text-gray-500 font-medium"> / year</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Price ID: <code className="bg-gray-200 rounded px-1">{annualPriceId}</code>
                        </p>
                        <button
                            onClick={() => handleCheckout(annualPriceId)}
                            disabled={loading || !stripe}
                            className="mt-4 w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {loading ? 'Redirecting...' : 'Purchase Annual'}
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
            </div>
        </div>
    );
}
