import { AggregatorClient,Env } from '@cetusprotocol/aggregator-sdk';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import BN from 'bn.js';

/**
 * Swaps tokens on Sui blockchain using Cetus Aggregator
 * @param privateKey - The private key for signing transactions
 * @param fromToken - The address of the token to swap from
 * @param toToken - The address of the token to swap to
 * @param amount - The amount of fromToken to swap (in base units)
 * @param slippage - The maximum acceptable slippage percentage (default: 0.01 = 1%)
 * @returns The transaction result
 */
export async function swapTokens(
  privateKey: string,
  fromToken: string,
  toToken: string,
  amount: string | number,
  slippage: number = 0.01
) {
  try {
    // Initialize the keypair from the private key
    const keypair = Ed25519Keypair.fromSecretKey(
      privateKey
    );

    const aggregatorURL = "https://api-sui.cetus.zone/router_v2/find_routes";

    const suiClient = new SuiClient({ url: "https://fullnode.mainnet.sui.io:443" });
    
    // Initialize the Aggregator client
    const client = new AggregatorClient(aggregatorURL, keypair.getPublicKey().toSuiAddress(), suiClient, Env.Mainnet);
    
    // Convert amount to BN (big number)
    const amountBN = new BN(amount.toString());
    
    console.log(`Finding best swap route for ${amount} of ${fromToken} to ${toToken}...`);
    
    // Find the best routers for the swap
    const routers = await client.findRouters({
      from: fromToken,
      target: toToken,
      amount: amountBN,
      byAmountIn: true, // true means fix input amount
    });
    
    if (!routers || routers.routes.length === 0) {
      throw new Error("No swap route found");
    }
    
    console.log("Best swap route found");
    
    // Create a new transaction
    const txb = new Transaction();
    
    // Execute fast router swap
    await client.fastRouterSwap({
      routers,
      txb,
      slippage,
    });
    
    // Simulate the transaction
    console.log("Simulating transaction...");
    const simulationResult = await client.devInspectTransactionBlock(txb);

    console.log(simulationResult);
    
    
    if (simulationResult.effects.status.status !== "success") {
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulationResult.effects.status)}`);
    }
    
    console.log("Simulation successful, executing transaction...");
    
    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction(txb, keypair);
    
    console.log("Swap transaction executed successfully");
    console.log("Transaction digest:", result.digest);
    
    return result;
  } catch (error) {
    console.error("Swap failed:", error);
    throw error;
  }
}
