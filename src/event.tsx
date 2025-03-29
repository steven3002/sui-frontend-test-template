import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Text } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import ClipLoader from "react-spinners/ClipLoader";
import { APPLICATION, EVENT, MEMORY_PACKAGE_ID, TAGHANDLERPHOTO } from "./constants";

export function AddImage() {
    const suiClient = useSuiClient();
    const { mutate: signAndExecute, isPending, isSuccess } = useSignAndExecuteTransaction();
    const [createdIds, setCreatedIds] = useState<string[]>([]);

    const addImage = async () => {
        const tx = new Transaction();



        tx.moveCall({
            target: `${MEMORY_PACKAGE_ID}::MEMO::add_image`,
            arguments: [
                // Object references for mutable parameters
                tx.object(APPLICATION), // Application object
                tx.object(EVENT),       // Event object
                tx.object(TAGHANDLERPHOTO), // TagHandlerPhoto object

                // String arguments: name and image URL
                tx.pure.string("My Image Name"),
                tx.pure.string("https://example.com/my-image.png"),

                // u64 values for longitude and latitude
                tx.pure.u64(123456),  // long (example value)
                tx.pure.u64(654321),  // lat (example value)

                // Eight tag strings
                tx.pure.string("tag1"),
                tx.pure.string("tag2"),
                tx.pure.string("tag3"),
                tx.pure.string("tag4"),
                tx.pure.string("tag5"),
                tx.pure.string("tag6"),
                tx.pure.string("tag7"),
                tx.pure.string("tag8"),

                // Object references for clock and transaction context
                tx.object("0x6"),

            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: async ({ digest }) => {
                    // Wait for the transaction to be confirmed and retrieve created objects
                    const { effects } = await suiClient.waitForTransaction({
                        digest,
                        options: { showEffects: true },
                    });

                    // Extract IDs of created objects (if any) from the transaction effects
                    const created = effects?.created?.map((obj: any) => obj.reference.objectId) || [];
                    setCreatedIds(created);
                },
                onError: (error) => {
                    console.error("Transaction failed:", error);
                },
            }
        );
    };

    return (
        <Container>
            <Button onClick={addImage} disabled={isPending || isSuccess}>
                {isPending || isSuccess ? <ClipLoader size={20} /> : "Add Image"}
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
