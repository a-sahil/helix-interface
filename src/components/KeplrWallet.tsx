import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

declare global {
  interface Window {
    keplr?: any;
  }
}

interface KeplrWalletProps {
  onConnect?: (address: string, userId: string) => void;
  apiBaseUrl?: string;
}

const KeplrWallet: React.FC<KeplrWalletProps> = ({ 
  onConnect,
  apiBaseUrl = "http://localhost:8000/api"
}) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const chainId = "injective-888"; // Injective Testnet chain ID

  // Find or create user by address
  const findOrCreateUser = async (address: string) => {
    try {
      setStatus("Checking if user exists...");
      
      // First try to find the user
      const findResponse = await fetch(`${apiBaseUrl}/users/${address}`);
      
      if (findResponse.ok) {
        const userData = await findResponse.json();
        console.log('User found:', userData);
        return userData;
      }
      
      // If user not found, create a new one
      setStatus("Creating new user...");
      const createResponse = await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      const userData = await createResponse.json();
      console.log('User created successfully:', userData);
      
      return userData;
    } catch (error) {
      console.error('Error finding/creating user:', error);
      throw error;
    }
  };

  const connectKeplrWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus("Connecting to Keplr wallet...");
      
      if (!window.keplr) {
        setError("Keplr extension not found. Please install Keplr.");
        return;
      }

      await window.keplr.enable(chainId);
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length > 0) {
        const address = accounts[0].address;
        setWalletAddress(address);
        
        // Find or create user in database
        const userData = await findOrCreateUser(address);
        
        if (userData && userData._id) {
          // Save user data to localStorage for persistence
          localStorage.setItem('walletAddress', address);
          localStorage.setItem('userId', userData._id);
          
          // Notify parent component
          onConnect?.(address, userData._id);
        } else {
          throw new Error("User data missing MongoDB ID");
        }
      } else {
        setError("Failed to retrieve accounts from Keplr.");
      }
    } catch (e) {
      setError("An error occurred: " + (e as Error).message);
      setWalletAddress(null);
    } finally {
      setIsLoading(false);
      setStatus(null);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <Button
          className="w-full"
          onClick={connectKeplrWallet}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status || "Connecting..."}
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>

        {error && (
          <p className="mt-4 text-sm text-destructive text-center">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default KeplrWallet;