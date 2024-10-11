import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function NextPage() {
  React.useEffect(() => {
    const updatesState = (value: string) => {
      console.log(value);
    };

    try {
      window.ipc.on("update-state", updatesState);
    } catch (error) {
      console.error("Error accessing ipcRenderer:", error);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Next - Nextron (basic-lang-typescript) v1.0.1</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -<Link href="/home">Go to home page</Link>
        </p>
      </div>
    </React.Fragment>
  );
}
