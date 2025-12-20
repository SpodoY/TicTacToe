import { BrowserProvider } from "ethers"
import { useState, useEffect } from "react";

declare global {
    interface Window {
        ethereum?: any
    }
}

export const useMetaMask = () => {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);

    useEffect(() => {
        if (!window.ethereum) return;

        const init = async () => {
            const browserProvider = new BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            const accounts = await browserProvider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);

            const network = await browserProvider.getNetwork();
            setChainId(Number(network.chainId));

            // Watch for account/network changes
            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                setAccount(accounts[0] || null);
            });
            window.ethereum.on("chainChanged", () => window.location.reload());
        };

        init();
    }, []);

    return { provider, account, chainId }
}