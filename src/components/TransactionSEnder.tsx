import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InjectivePlugin } from "./InjectivePlugin"; // Adjust the import path

interface TransactionSenderProps {
  walletAddress: string;
  toAddress: string;
  amount: number;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

const TransactionSender: React.FC<TransactionSenderProps> = ({
  walletAddress,
  toAddress,
  amount,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [injectivePlugin, setInjectivePlugin] = useState<InjectivePlugin | null>(null);

  // Initialize the Injective plugin on component mount
  useEffect(() => {
    const plugin = new InjectivePlugin();
    setInjectivePlugin(plugin);
  }, []);

  const handleSendTransaction = async () => {
    if (!injectivePlugin) {
      setError("Plugin not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Check if Keplr is installed
      if (!window.keplr) {
        throw new Error("Keplr wallet extension not found. Please install Keplr.");
      }

      // Enable Keplr access to Injective testnet
      await window.keplr.enable("injective-888");

      // Get accounts from Keplr
      const offlineSigner = window.keplr.getOfflineSigner("injective-888");
      const accounts = await offlineSigner.getAccounts();

      // Check if wallet address exists in Keplr accounts
      const walletExists = accounts.some(account => account.address === walletAddress);
      if (!walletExists) {
        throw new Error(`The wallet address ${walletAddress} is not available in Keplr`);
      }

      // Send the transaction
      const hash = await injectivePlugin.sendTransaction(
        amount,
        walletAddress,
        toAddress
      );

      // Set the transaction hash and call the success callback
      setTxHash(hash);
      if (onSuccess) {
        onSuccess(hash);
      }
    } catch (err) {
      console.error("Transaction error:", err);
      const errorMessage = (err as Error).message || "Unknown error occurred";
      setError(errorMessage);
      if (onError) {
        onError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Transaction</CardTitle>
        <CardDescription>
          Send {amount} INJ from your wallet to {toAddress}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="text-sm font-medium">From Address:</div>
            <div className="font-mono text-xs truncate bg-gray-100 p-2 rounded">
              {walletAddress}
            </div>
            
            <div className="text-sm font-medium">To Address:</div>
            <div className="font-mono text-xs truncate bg-gray-100 p-2 rounded">
              {toAddress}
            </div>
            
            <div className="text-sm font-medium">Amount:</div>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded">
              {amount} INJ
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSendTransaction} 
            disabled={isLoading || !injectivePlugin}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Transaction...
              </>
            ) : (
              "Send Transaction"
            )}
          </Button>

          {txHash && (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle>Transaction Sent!</AlertTitle>
              <AlertDescription>
                <div className="text-sm">Transaction Hash:</div>
                <div className="font-mono text-xs truncate">
                  {txHash}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTitle>Transaction Failed</AlertTitle>
              <AlertDescription className="text-sm text-red-600">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionSender;