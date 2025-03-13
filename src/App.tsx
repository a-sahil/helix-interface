import { useState } from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from './components/LandingPage';
import TransactionForm from './components/TransactionForm';
import KeplrWallet from './components/KeplrWallet';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { PlusCircle, ListPlus } from 'lucide-react';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [showPlans, setShowPlans] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'create' | 'view' | null>(null);

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
    setIsWalletConnected(true);
  };

  const handleOptionSelect = (option: 'create' | 'view') => {
    setSelectedOption(option);
    if (option === 'create') {
      setShowForm(true);
    } else {
      setShowPlans(true);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <AnimatePresence>
          {isWalletConnected && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed top-0 right-0 p-4 z-50"
            >
              <p className="text-sm text-muted-foreground">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && !showPlans ? (
          <>
            {!isWalletConnected ? (
              <div className="container mx-auto px-4 py-8">
                <LandingPage onLaunch={() => setShowForm(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <KeplrWallet onConnect={handleWalletConnect} />
                </motion.div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="container mx-auto px-4 py-8 mt-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="cursor-pointer" onClick={() => handleOptionSelect('create')}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <PlusCircle className="mr-2 h-6 w-6" />
                          Create a Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Set up a new automated transaction plan with custom parameters
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="cursor-pointer" onClick={() => handleOptionSelect('view')}>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <ListPlus className="mr-2 h-6 w-6" />
                          View Your Plans
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Review and manage your existing transaction plans
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </>
        ) : showForm ? (
          <div className="container mx-auto px-4 py-8">
            <TransactionForm walletAddress={''} />
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setSelectedOption(null);
              }}>
                Back to Options
              </Button>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No plans found. Create your first plan to get started.</p>
              </CardContent>
            </Card>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => {
                setShowPlans(false);
                setSelectedOption(null);
              }}>
                Back to Options
              </Button>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;