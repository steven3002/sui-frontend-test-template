import React, { useState } from "react";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Heading, Text, Flex, Box } from "@radix-ui/themes";
import { MEMORY_PACKAGE_ID } from "./constants";

export function ProfileListDisplay() {
    const currentAccount = useCurrentAccount();
    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    // Filter only objects of type Profile.
    const profileTypeFilter = { StructType: `${MEMORY_PACKAGE_ID}::MEMO::Profile` };

    // Query owned objects filtered by`1 Profile type.
    const { data, isPending, error } = useSuiClientQuery("getOwnedObjects", {
        owner: currentAccount?.address ?? "",
        filter: profileTypeFilter,
        options: { showContent: true },
    });

    console.log("Profile object data:", data);

    function handleSelect(profile: any) {
        setSelectedProfile(profile);
    }

    function renderProfileCard(profile: any) {
        if (profile.data.content?.dataType !== "moveObject") return null;
        const fields = profile.data.content.fields;
        return (
            <Box
                key={profile.data.objectId}
                style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    width: "250px",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                }}
                onClick={() => handleSelect(profile)}
                onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(1.03)")
                }
                onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
                }
            >
                <Flex direction="column" align="center">
                    <img
                        src={fields.image}
                        alt={fields.name}
                        style={{
                            width: "100%",
                            height: "150px",
                            objectFit: "cover",
                        }}
                    />
                    <Box style={{ padding: "1rem", textAlign: "center" }}>
                        <Heading size="4" style={{ margin: "0.5rem 0" }}>
                            {fields.name}
                        </Heading>
                        <Text style={{ color: "#666" }}>{fields.email}</Text>
                    </Box>
                </Flex>
            </Box>
        );
    }

    function renderProfileDetails(profile: any) {
        if (profile.data.content?.dataType !== "moveObject") {
            return <Text>Invalid profile data.</Text>;
        }
        const fields = profile.data.content.fields;
        return (
            <Box
                style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    padding: "1.5rem",
                    marginTop: "2rem",
                }}
            >
                <Flex direction="row" align="center" gap="1rem">
                    <img
                        src={fields.image}
                        alt={fields.name}
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                    <Box>
                        <Heading size="4">{fields.name}</Heading>
                        <Text>{fields.email}</Text>
                    </Box>
                </Flex>
                <Box style={{ marginTop: "1.5rem" }}>
                    <Heading size="5">Event List</Heading>
                    {fields.event_list && fields.event_list.length > 0 ? (
                        <ul style={{ marginLeft: "1rem" }}>
                            {fields.event_list.map((id: string, idx: number) => (
                                <li key={idx}>
                                    <Text>{id}</Text>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text>No events created.</Text>
                    )}
                </Box>
                <Box style={{ marginTop: "1.5rem" }}>
                    <Heading size="5">Claimed NFTs</Heading>
                    {fields.claimedNft_list && fields.claimedNft_list.length > 0 ? (
                        <ul style={{ marginLeft: "1rem" }}>
                            {fields.claimedNft_list.map((id: string, idx: number) => (
                                <li key={idx}>
                                    <Text>{id}</Text>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text>No claimed NFTs.</Text>
                    )}
                </Box>
            </Box>
        );
    }

    return (
        <Container style={{ padding: "2rem", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
            <Heading size="3" style={{ marginBottom: "2rem", textAlign: "center" }}>
                My Profiles
            </Heading>
            {isPending && <Text style={{ textAlign: "center" }}>Loading profiles...</Text>}
            {error && <Text style={{ textAlign: "center", color: "red" }}>Error: {error.message}</Text>}
            {data && data.data && data.data.length > 0 ? (
                <Flex direction="row" wrap="wrap" gap="1.5rem" justify="center">
                    {data.data.map((profile: any) => renderProfileCard(profile))}
                </Flex>
            ) : (
                <Text style={{ textAlign: "center" }}>No profiles found.</Text>
            )}
            {selectedProfile && renderProfileDetails(selectedProfile)}
        </Container>
    );
}
