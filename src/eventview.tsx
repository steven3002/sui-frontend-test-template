import React, { useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { APPLICATION, MEMORY_PACKAGE_ID } from "./constants";
import { fromB58, toHEX } from "@mysten/bcs";


export function ViewEventComponent() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function viewEvent() {
        setLoading(true);
        setResult(null);

        // Initialize the client for testnet
        const client = new SuiClient({ url: getFullnodeUrl("testnet") });

        // Replace these with your actual on-chain values:
        const packageId = MEMORY_PACKAGE_ID;             // Package where your module is deployed
        const moduleName = "MEMO";                        // Module name
        const functionName = "viewEvent";                 // Your view function name
        const applicationObjectId = APPLICATION;          // The Application object's ID
        const sender = "0xbffd2a1e8aae0e2bd8817e721bc3f4eb5128e54babfc441c9f5646736f4c6bbe"; // Your sender's address

        // For u256 values, we pass them as pure arguments (strings are acceptable for large numbers)
        const startIndex = "1";  // Example start index
        const endIndex = "2";    // Example end index

        // Build a transaction block using the Transaction builder.
        const tx = new Transaction();
        tx.moveCall({
            target: `${packageId}::${moduleName}::${functionName}`,
            arguments: [
                tx.object(applicationObjectId), // Pass the application object as an object reference
                tx.pure.u256(startIndex),          // start_index as a u256
                tx.pure.u256(endIndex),            // end_index as a u256
            ],
        });

        try {
            // Call devInspectTransactionBlock with the transaction block.
            const inspectResult = await client.devInspectTransactionBlock({
                sender,
                transactionBlock: tx,
                // Optional: You can specify gasPrice or epoch if needed
                // gasPrice: "1",
                // epoch: 0,
            });
            console.log("Raw viewEvent result:", inspectResult);
            setResult(inspectResult);

            // Suppose this is your returned byte array (extracted from the JSON above)
            const byteArray = Uint8Array.from([
                2, 110, 246, 111, 189, 41, 208, 198, 123, 56, 23, 132, 222, 63, 164, 222,
                175, 109, 249, 118, 89, 69, 59, 192, 14, 26, 195, 150, 49, 45, 54, 161, 233,
                182, 94, 172, 86, 234, 10, 113, 15, 134, 96, 237, 75, 108, 146, 239, 34, 33,
                80, 165, 36, 196, 13, 213, 105, 161, 46, 75, 117, 220, 85, 26, 66
            ]);

            // Convert the byte array to a hex string.
            const hexId = toHEX(byteArray);
            console.log("Decoded Object ID:", hexId);

        } catch (error) {
            console.error("Error calling viewEvent:", error);
            setResult({ error: error instanceof Error ? error.message : error });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: "1rem", border: "1px solid #ccc", margin: "1rem 0" }}>
            <button onClick={viewEvent} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
                {loading ? "Loading..." : "View Event"}
            </button>
            {result && (
                <pre style={{ marginTop: "1rem", background: "#f8f8f8", padding: "1rem" }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}
