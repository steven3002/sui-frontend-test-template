import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Text } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import ClipLoader from "react-spinners/ClipLoader";
import { APPLICATION } from "./constants";
import { MEMORY_PACKAGE_ID } from "./constants";

export function SetProfile() {
    const suiClient = useSuiClient();
    const { mutate: signAndExecute, isSuccess, isPending } = useSignAndExecuteTransaction();
    const [createdIds, setCreatedIds] = useState<string[]>([]);

    function setProfile() {
        const tx = new Transaction();

        tx.moveCall({
            target: `${MEMORY_PACKAGE_ID}::MEMO::set_profile`,
            arguments: [
                // Object reference for the mutable Application parameter
                tx.object(APPLICATION),
                // Pure values for the profile fields: name, image, and email.
                tx.pure.string("John Doe"),
                tx.pure.string("https://example.com/profile-image.png"),
                tx.pure.string("john.doe@example.com"),

            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: async ({ digest }) => {
                    // Wait for transaction confirmation and fetch transaction effects with created objects
                    const { effects } = await suiClient.waitForTransaction({
                        digest: digest,
                        options: { showEffects: true },
                    });

                    // Extract created object IDs from the transaction effects
                    const created = effects?.created?.map((obj: any) => obj.reference.objectId) || [];
                    setCreatedIds(created);
                },
                onError: (error) => {
                    console.error("Transaction failed:", error);
                },
            }
        );
    }

    return (
        <Container>
            <Button size="3" onClick={setProfile} disabled={isSuccess || isPending}>
                {isSuccess || isPending ? <ClipLoader size={20} /> : "Set Profile"}
            </Button>
            <Container style={{ marginTop: "20px" }}>
                <Text >Created Object IDs:</Text>
                {createdIds.length > 0 ? (
                    <ul>
                        {createdIds.map((id) => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                ) : (
                    <Text>No objects created yet.</Text>
                )}
            </Container>
        </Container>
    );
}
