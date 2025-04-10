import React, { useState, useEffect } from "react";
import {
    useSuiClient,
    useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Container, Heading, Text, Button, Flex } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import {
    WARLOT_PACKAGEID_4,
    BUCKET_MODULE,
    USE_PROJECT_4,
} from "./constants";
// import type { SuiObjectResponse } from "@mysten/sui"; 

export function BucketDisplay() {
    const suiClient = useSuiClient();
    const { mutate: signAndExecute, isPending: txPending } = useSignAndExecuteTransaction();

    // Explicitly define the state type here for bucket objects.
    const [buckets, setBuckets] = useState<any>([]);
    const [loadingBuckets, setLoadingBuckets] = useState(true);
    const [bucketsError, setBucketsError] = useState<any>(null);

    // State for new bucket creation modal
    const [isModalOpen, setModalOpen] = useState(false);
    const [newBucketName, setNewBucketName] = useState("");
    const [newBucketDesc, setNewBucketDesc] = useState("");

    // Fetch bucket objects from the given project.
    async function fetchBuckets() {
        setLoadingBuckets(true);
        setBucketsError(null);
        try {
            // Call getDynamicFields to get the dynamic fields for the project.
            const dynamicFieldsResponse = await suiClient.getDynamicFields({
                parentId: USE_PROJECT_4,
            });
            // Check if the response has a data array.
            if (dynamicFieldsResponse && Array.isArray(dynamicFieldsResponse.data)) {
                // Filter for bucket objects using their objectType.
                const bucketFields = dynamicFieldsResponse.data.filter(
                    (f) =>
                        f.objectType ===
                        `${WARLOT_PACKAGEID_4}::${BUCKET_MODULE}::Bucket`
                );
                const bucketIds = bucketFields.map((b) => b.objectId);
                // Fetch full details for each bucket.
                const bucketsResponse = await suiClient.multiGetObjects({
                    ids: bucketIds,
                    options: { showContent: true },
                });
                setBuckets(bucketsResponse);
            } else {
                setBuckets([]);
            }
        } catch (error) {
            setBucketsError(error);
        } finally {
            setLoadingBuckets(false);
        }
    }

    // Fetch buckets on component mount.
    useEffect(() => {
        fetchBuckets();
    }, []);

    // Function to create a new bucket in the project.
    function handleCreateBucket() {
        const tx = new Transaction();
        tx.moveCall({
            target: `${WARLOT_PACKAGEID_4}::bucketmain::create_bucket`,
            arguments: [
                // The project ID where the bucket will be added.
                tx.object(USE_PROJECT_4),
                tx.pure.string(newBucketName),
                tx.pure.string(newBucketDesc),
                // This object may be used by the contract to reference the current time.
                tx.object("0x6"),
            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: async ({ digest }) => {
                    const { effects } = await suiClient.waitForTransaction({ digest });
                    console.log("Bucket creation effects:", effects);
                    // Refresh the buckets list.
                    await fetchBuckets();
                    setModalOpen(false);
                    setNewBucketName("");
                    setNewBucketDesc("");
                },
                onError: (error) => {
                    console.error("Bucket creation failed:", error);
                },
            }
        );
    }

    return (
        <Container style={{ padding: "1rem" }}>
            <Heading size="4" mb="3">
                Buckets in Project
            </Heading>

            {loadingBuckets && <Text>Loading buckets...</Text>}
            {bucketsError && (
                <Text color="red">Error: {bucketsError.message}</Text>
            )}

            {buckets && buckets.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {buckets.map((bucket: any) => (
                        <li
                            key={bucket.data.objectId}
                            style={{
                                borderBottom: "1px solidrgb(248, 2, 2)",
                                padding: "0.75rem 0",
                            }}
                        >
                            <Text>
                                <strong>Name:</strong> {bucket.data.content.fields.name}
                                <br />
                                <strong>Description:</strong>{" "}
                                {bucket.data.content.fields.description}
                            </Text>
                        </li>
                    ))}
                </ul>
            ) : (
                !loadingBuckets && <Text>No buckets found.</Text>
            )}

            {/* Create New Bucket Modal */}
            <Dialog.Root open={isModalOpen} onOpenChange={setModalOpen}>
                <Dialog.Trigger asChild>
                    <Button style={{ marginTop: "1rem" }}>Create New Bucket</Button>
                </Dialog.Trigger>
                <Dialog.Portal>
                    <Dialog.Overlay
                        style={{
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            position: "fixed",
                            inset: 0,
                        }}
                    />
                    <Dialog.Content
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            padding: "24px",
                            width: "400px",
                            position: "fixed",
                            top: "20%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                    >
                        <Dialog.Title>
                            <Heading size="4">Create a New Bucket</Heading>
                        </Dialog.Title>
                        <Flex direction="column" gap="3" mt="4">
                            <input
                                style={{
                                    padding: "10px",
                                    fontSize: "16px",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    outline: "none",
                                }}
                                placeholder="Enter bucket name"
                                value={newBucketName}
                                onChange={(e) => setNewBucketName(e.target.value)}
                            />
                            <input
                                style={{
                                    padding: "10px",
                                    fontSize: "16px",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    outline: "none",
                                }}
                                placeholder="Enter bucket description"
                                value={newBucketDesc}
                                onChange={(e) => setNewBucketDesc(e.target.value)}
                            />
                            <Button
                                onClick={handleCreateBucket}
                                disabled={txPending || !newBucketName || !newBucketDesc}
                            >
                                {txPending ? <ClipLoader size={20} /> : "Create Bucket"}
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Container>
    );
}
