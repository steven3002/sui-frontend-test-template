import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { isValidSuiObjectId } from "@mysten/sui/utils";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { useSuiClientQuery } from "@mysten/dapp-kit";

import { ProjectDisplay } from "./projectx";
import { USE_PROJECT_4 } from "./constants";
import { BucketDisplay } from "./bucket";
import { TableDisplay } from "./tablex";
function App() {
  const currentAccount = useCurrentAccount();
  const [counterId, setCounter] = useState(() => {
    const hash = window.location.hash.slice(1);
    return isValidSuiObjectId(hash) ? hash : null;
  });

  const { data, isPending, error, refetch } = useSuiClientQuery("multiGetObjects", {
    ids: [
      "0xdb42977a933070013b8debc8ba3acf84a6a8328a8213bde5fa65cac2704c49ec",
      "0xeb14f2125ed8c2454b765bf25790dd949b342e041f3978a4540467706f81a88f",

    ],

    options: { showContent: true },
  });
  console.log(data)



  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>dApp Starter Template</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
        // style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          {currentAccount ? (

            <TableDisplay
            />


          ) : (
            <Heading>Please connect your wallet</Heading>
          )}
        </Container>
      </Container>
    </>
  );
}

export default App;