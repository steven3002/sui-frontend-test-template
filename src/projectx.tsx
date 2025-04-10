import React, { useState } from "react";
// import { JsonRpcProvider } from '@mysten/sui';
import {
    useSuiClientQuery,
    useCurrentAccount,
    useSuiClient,
    useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Container, Heading, Text, Button, Flex } from "@radix-ui/themes";
import * as Dialog from "@radix-ui/react-dialog";
import { Transaction } from "@mysten/sui/transactions";
import ClipLoader from "react-spinners/ClipLoader";
import { WARLOT_PACKAGEID_4, PROJECT_MODULE } from "./constants";

export function ProjectDisplay() {
    const currentAccount = useCurrentAccount();
    const { data, isPending, error, refetch } = useSuiClientQuery("getOwnedObjects", {
        owner: currentAccount?.address ?? "",
        filter: { StructType: `${WARLOT_PACKAGEID_4}::${PROJECT_MODULE}::Project` },
        options: { showContent: true },
    });




    // "0x2b430ce70ad60ee98e875b86e969643b47bd92fa113b6e388bca7ee4d25ef5c2"
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const { mutate: signAndExecute, isPending: txPending } = useSignAndExecuteTransaction();
    const suiClient = useSuiClient();

    function handleCreateProject() {
        const tx = new Transaction();
        tx.moveCall({
            target: `${WARLOT_PACKAGEID_4}::${PROJECT_MODULE}::create_project`,
            arguments: [
                tx.pure.string(newProjectName),
                tx.pure.string(newProjectDesc),
                tx.object("0x6")
            ],
        });

        signAndExecute(
            { transaction: tx },
            {
                onSuccess: async ({ digest }) => {
                    const { effects } = await suiClient.waitForTransaction({ digest });
                    const createdProject = effects?.created?.[0]?.reference.objectId;
                    if (createdProject) {
                        console.log("Created Project ID:", createdProject);
                        await refetch();
                    }
                    setModalOpen(false);
                    setNewProjectName("");
                    setNewProjectDesc("");
                },
                onError: (error) => {
                    console.error("Transaction failed:", error);
                },
            }
        );
    }

    return (
        <Container style={{ padding: "1rem" }}>
            <Heading size="4" mb="3">My Projects</Heading>

            {isPending && <Text>Loading projects...</Text>}
            {error && <Text color="red">Error: {error.message}</Text>}

            {data?.data?.length ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {data.data.map((project: any) => (
                        <li
                            key={project.data.objectId}
                            onClick={() => setSelectedProject(project)}
                            style={{
                                cursor: "pointer",
                                borderBottom: "1px solid #e0e0e0",
                                padding: "0.75rem 0",
                            }}
                        >
                            <Text>
                                <strong>Name:</strong> {project.data.content.fields.name}
                                <br />
                                <strong>Address:</strong> {project.data.objectId}
                            </Text>
                        </li>
                    ))}
                </ul>
            ) : (
                <Text>No projects found.</Text>
            )}

            {selectedProject && (
                <Container
                    style={{
                        marginTop: "1.5rem",
                        padding: "1rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                    }}
                >
                    <Heading size="3" mb="2">Project Details</Heading>
                    <Text><strong>ID:</strong> {selectedProject.data.objectId}</Text><br />
                    <Text><strong>Name:</strong> {selectedProject.data.content.fields.name}</Text><br />
                    <Text><strong>Description:</strong> {selectedProject.data.content.fields.description}</Text><br />
                    <Text><strong>Time Created:</strong> {selectedProject.data.content.fields.time_created}</Text>
                </Container>
            )}

            <Dialog.Root open={isModalOpen} onOpenChange={setModalOpen}>
                <Dialog.Trigger asChild>
                    <Button style={{ marginTop: "1rem" }}>Create New Project</Button>
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
                            <Heading size="4">Create a New Project</Heading>
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
                                placeholder="Enter project name"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                            />
                            <input
                                style={{
                                    padding: "10px",
                                    fontSize: "16px",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    outline: "none",
                                }}
                                placeholder="Enter project description"
                                value={newProjectDesc}
                                onChange={(e) => setNewProjectDesc(e.target.value)}
                            />

                            <Button
                                onClick={handleCreateProject}
                                disabled={txPending || !newProjectName || !newProjectDesc}
                            >
                                {txPending ? <ClipLoader size={20} /> : "Create Project"}
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </Container>
    );
}
