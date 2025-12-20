import { configVariable, type HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      mining: {
        auto: true,
        interval: 12000
      },
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"), // `https://sepolia.infura.io/v3/${INFURA_KEY}`,
      accounts: [configVariable("MNEMONIC")]  // 12 words from wallet
      // to use configVariable check https://hardhat.org/docs/guides/configuration-variables
    }
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
};

export default config;
