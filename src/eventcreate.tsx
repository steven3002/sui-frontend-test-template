import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Text } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import ClipLoader from "react-spinners/ClipLoader";
import { APPLICATION, CATEGORY, PROFILE, TAGHANDLEREVENT, MEMORY_PACKAGE_ID } from "./constants";
// import { bcs } from "@mysten/bcs";
// import { bcs, getSuiMoveConfig } from "@mysten/bcs";

// // Initialize the BCS with the Sui Move configuration
// const bcs = new BCS(getSuiMoveConfig());

// // Example of serializing a vector of strings
// const serializedVector = bcs.ser("vector<string>", ["tag1", "tag2"]);


// Example: create a new BCS instance


export function CreateEvent() {
    const suiClient = useSuiClient();
    const { mutate: signAndExecute, isSuccess, isPending } = useSignAndExecuteTransaction();
    const [createdIds, setCreatedIds] = useState<string[]>([]);

    // let utf8_str_1 = "string1";
    // let utf8_str_2 = "string2";
    // let utf_str_vec_bcs = bcs:: to_bytes(& vec![utf8_str_1, utf8_str_2]).unwrap();

    function createEvent() {
        const tx = new Transaction();

        // Build the move call for the create_event function
        tx.moveCall({
            target: `${MEMORY_PACKAGE_ID}::MEMO::create_event`,
            arguments: [
                // Object references for mutable parameters
                tx.object(APPLICATION),       // application
                tx.object(PROFILE),           // profile
                tx.object(TAGHANDLEREVENT),     // tag_handler_event
                tx.object(CATEGORY),            // category_object

                // u64 values for time, longitude, and latitude
                tx.pure.u64(1743202204000),  // time (example timestamp; replace as needed)
                tx.pure.u64(123456),      // long (example longitude)
                tx.pure.u64(654321),      // lat (example latitude)

                // Strings for event details
                tx.pure.string("Event Name 2.0.01"),           // name
                tx.pure.string("Event Description"),    // description
                tx.pure.string("Event Profile"),        // event_profile
                tx.pure.string("Event Banner"),         // event_bannar

                // Reward details
                tx.pure.string("Reward Name"),          // reward_name
                tx.pure.string("Reward Description"),   // reward_description
                tx.pure.string("Reward Image URL"),     // reward_image

                // // Vector of event name tags
                // tx.pure(
                //     serializedVector
                // ),
                // event_name_tag

                // Category string
                tx.pure.string("test"),             // category

                // Object references for coin, clock, and TxContext
                // tx.object(COIN),      // coin
                tx.object("0x6"),     // clock
            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: async ({ digest }) => {
                    // Wait for the transaction to complete and return its effects (including created objects)
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
            <Button size="3" onClick={createEvent} disabled={isSuccess || isPending}>
                {isSuccess || isPending ? <ClipLoader size={20} /> : "Create Event"}
            </Button>
            <Container style={{ marginTop: "20px" }}>
                <Text >Created Event Object IDs:</Text>
                {createdIds.length > 0 ? (
                    <ul>
                        {createdIds.map((id) => (
                            <li key={id}>{id}</li>
                        ))}
                    </ul>
                ) : (
                    <Text>No event objects created yet.</Text>
                )}
            </Container>
        </Container>
    );
}
