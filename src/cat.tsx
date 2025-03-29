import React, { useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { CATEGORY, MEMORY_PACKAGE_ID } from "./constants"; // your constants file
import { toHEX } from "@mysten/bcs";

export function GetMutObjListCategoryComponent() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function getMutObjListCategory() {
        setLoading(true);
        setResult(null);

        // Initialize the client (using testnet in this example)
        const client = new SuiClient({ url: getFullnodeUrl("testnet") });

        // Replace these with your actual on-chain values:
        const packageId = MEMORY_PACKAGE_ID;              // Package ID for your module
        const moduleName = "MEMO";                         // Module name (change if needed)
        const functionName = "get_mut_obj_list_category";  // Your function name
        const categoryObjectId = CATEGORY;          // The Category object ID
        const sender = "0xbffd2a1e8aae0e2bd8817e721bc3f4eb5128e54babfc441c9f5646736f4c6bbe"; // Your sender address
        const categoryStr = "test";            // The category string you wish to query

        // Build a transaction block using the Transaction builder.
        const tx = new Transaction();
        tx.moveCall({
            target: `${packageId}::${moduleName}::${functionName}`,
            arguments: [
                tx.object(categoryObjectId), // Pass the Category object as an object reference
                tx.pure.string(categoryStr),          // Pass the category as a pure string argument
            ],
        });

        try {
            // Call devInspectTransactionBlock to simulate the execution
            const inspectResult = await client.devInspectTransactionBlock({
                sender,
                transactionBlock: tx,
            });
            console.log("Raw get_mut_obj_list_category result:", inspectResult);
            setResult(inspectResult);


            const rawBytes = Uint8Array.from([
                2, 110, 246, 111, 189, 41, 208, 198, 123, 56, 23, 132, 222, 63, 164, 222,
                175, 109, 249, 118, 89, 69, 59, 192, 14, 26, 195, 150, 49, 45, 54, 161,
                233, 182, 94, 172, 86, 234, 10, 113, 15, 134, 96, 237, 75, 108, 146, 239,
                34, 33, 80, 165, 36, 196, 13, 213, 105, 161, 46, 75, 117, 220, 85, 26, 66
            ]);

            const decodedId = toHEX(rawBytes);
            console.log("Decoded Object ID:", decodedId);

        } catch (error) {
            console.error("Error calling get_mut_obj_list_category:", error);
            setResult({ error: error instanceof Error ? error.message : error });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ padding: "1rem", border: "1px solid #ccc", margin: "1rem 0" }}>
            <button onClick={getMutObjListCategory} disabled={loading} style={{ padding: "0.5rem 1rem" }}>
                {loading ? "Loading..." : "Get Mut Object List Category"}
            </button>
            {result && (
                <pre style={{ marginTop: "1rem", background: "#f8f8f8", padding: "1rem" }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}
