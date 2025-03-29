import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Text } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import ClipLoader from "react-spinners/ClipLoader";
import { APPLICATION, EVENT, IMAGE, MEMORY_PACKAGE_ID } from "./constants";

export function LikePic() {
    const suiClient = useSuiClient();
    const { mutate: signAndExecute, isPending, isSuccess } = useSignAndExecuteTransaction();
    const [effectsInfo, setEffectsInfo] = useState<string[]>([]);

    const likePic = async () => {
        const tx = new Transaction();

        // Replace these with your actual package ID, module name, and object IDs


        tx.moveCall({
            target: `${MEMORY_PACKAGE_ID}::MEMO::like_pic`,
            arguments: [
                tx.object(APPLICATION),  // Application object
                tx.object(EVENT),        // Event object
                tx.object(IMAGE),        // Photo object

            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: async ({ digest }) => {
                    console.log("Transaction submitted with digest:", digest);
                    try {
                        // Wait for the transaction to be confirmed and retrieve its effects
                        const { effects } = await suiClient.waitForTransaction({
                            digest,
                            options: { showEffects: true },
                        });
                        // Log or extract relevant information; for example, list created objects if any
                        const created = effects?.created?.map((obj: any) => obj.reference.objectId) || [];
                        setEffectsInfo(created);
                        console.log("Transaction effects:", effects);
                    } catch (err) {
                        console.error("Error waiting for transaction confirmation:", err);
                    }
                },
                onError: (error) => {
                    console.error("Transaction failed:", error);
                },
            }
        );
    };

    return (
        <Container>
            <Button onClick={likePic} disabled={isPending || isSuccess}>
                {isPending || isSuccess ? <ClipLoader size={20} /> : "Like Pic"}
            </Button>
            <Container style={{ marginTop: "20px" }}>
                <Text >Transaction Effects:</Text>
                {effectsInfo.length > 0 ? (
                    <ul>
                        {effectsInfo.map((id) => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                ) : (
                    <Text>No effects recorded yet.</Text>
                )}
            </Container>
        </Container>
    );
}
