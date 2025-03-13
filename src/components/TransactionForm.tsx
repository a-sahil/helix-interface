import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TransactionFormProps {
  walletAddress: string;
  apiBaseUrl?: string;
  onSuccess?: () => void;
}

export default function TransactionForm({
  walletAddress,
  apiBaseUrl = "http://localhost:8000/api",
  onSuccess
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("1");
  const [unit, setUnit] = useState("minutes");
  const [risk, setRisk] = useState("low");
  const [toAddress, setToAddress] = useState("");

  // Get the user ID when component mounts or wallet address changes
  useEffect(() => {
    // First try to get the userId from localStorage
    const savedUserId = localStorage.getItem('userId');
    
    if (savedUserId) {
      console.log("Found saved user ID in localStorage:", savedUserId);
      setUserId(savedUserId);
    } else if (walletAddress) {
      // If no savedUserId but we have walletAddress, fetch from API
      fetchUserByAddress();
    }
  }, [walletAddress]);

  // Fetch user by wallet address
  const fetchUserByAddress = async () => {
    try {
      console.log("Fetching user with wallet address:", walletAddress);
      
      const response = await fetch(`${apiBaseUrl}/users/${walletAddress}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log("User found:", userData);
        
        if (userData._id) {
          setUserId(userData._id);
          localStorage.setItem('userId', userData._id);
        } else {
          console.error("User data missing _id field:", userData);
          setError("User data is incomplete. Please try reconnecting your wallet.");
        }
      } else {
        console.error("User not found by address");
        setError("Failed to retrieve user information. Please reconnect your wallet.");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(`Failed to get user data: ${(err as Error).message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!userId) {
        throw new Error("User ID not available. Please reconnect your wallet.");
      }

      // Map the UI frequency unit to the backend format
      let frequencyValue: string;
      if (unit === "minutes") frequencyValue = "minute";
      else if (unit === "hours") frequencyValue = "hour";
      else frequencyValue = "day";

      // Create the API payload
      const apiData = {
        userId: userId,
        amount: parseFloat(amount),
        frequency: frequencyValue,
        toAddress: toAddress
      };

      console.log("Sending data to API:", apiData);

      // Send request to create DCA plan
      const response = await fetch(`${apiBaseUrl}/dca/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create investment plan");
      }

      console.log("Plan created successfully:", responseData);
      
      // Reset form
      setAmount("");
      setFrequency("1");
      setUnit("minutes");
      setRisk("low");
      setToAddress("");
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error:", error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Transaction</CardTitle>
        <CardDescription>
          Set up your recurring transaction details below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount per Transfer</Label>
              <Input
                id="amount"
                placeholder="0.0"
                type="number"
                step="0.000001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                placeholder="INJ"
                value="INJ"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                placeholder="1"
                type="number"
                min="1"
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={unit} 
                onValueChange={setUnit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk">Risk Level</Label>
            <Select 
              value={risk} 
              onValueChange={setRisk}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose your preferred risk level for this transaction
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">To Address</Label>
            <Input
              id="address"
              placeholder="0x..."
              required
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter the recipient's wallet address
            </p>
          </div>

          {!userId && (
            <div className="flex items-center text-amber-600 text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Getting user information...
            </div>
          )}

          <Button 
            className="w-full" 
            type="submit" 
            disabled={isLoading || !userId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling Transaction...
              </>
            ) : (
              "Schedule Transaction"
            )}
          </Button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}