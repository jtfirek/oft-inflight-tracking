import { Address, createPublicClient, encodeEventTopics, http, Log, keccak256, parseAbiItem } from 'viem';
import { mainnet, blast, mode, linea, base, bsc, optimism, scroll, zksync } from 'viem/chains';
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

const rpcKey = process.env.ALCHEMY_KEY || '';

const chains = [
    { 
      name: 'Mainnet', 
      client: createPublicClient({ 
        chain: mainnet, 
        transport: http("https://eth-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0xFE7fe01F8B9A76803aF3750144C2715D9bcf7D0D',
      blockTime: 12,
    },
    { 
      name: 'Blast', 
      client: createPublicClient({ 
        chain: blast, 
        transport: http("https://blast-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
      blockTime: 2,
    },
    { 
      name: 'Mode', 
      client: createPublicClient({ 
        chain: mode, 
        transport: http("https://mode-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
      blockTime: 2,
    },
    { 
      name: 'Linea', 
      client: createPublicClient({ 
        chain: linea, 
        transport: http("https://linea-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x1bf74c010e6320bab11e2e5a532b5ac15e0b8aa6',
      blockTime: 2,
    },
    { 
      name: 'Base', 
      client: createPublicClient({ 
        chain: base, 
        transport: http("https://base-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
      blockTime: 2,
    },
    { 
      name: 'BSC', 
      client: createPublicClient({ 
        chain: bsc, 
        transport: http("https://bnb-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A',
      blockTime: 3,
    },
    { 
      name: 'Optimism', 
      client: createPublicClient({ 
        chain: optimism, 
        transport: http("https://opt-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x5A7fACB970D094B6C7FF1df0eA68D99E6e73CBFF',
      blockTime: 2,
    },
    { 
      name: 'Scroll', 
      client: createPublicClient({ 
        chain: scroll, 
        transport: http("https://scroll-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0x01f0a31698c4d065659b9bdc21b3610292a1c506',
      blockTime: 3,
    },
    { 
      name: 'ZkSync', 
      client: createPublicClient({ 
        chain: zksync, 
        transport: http("https://zksync-mainnet.g.alchemy.com/v2/" + rpcKey) 
      }),
      contractAddress: '0xc1fa6e2e8667d9be0ca938a54c7e0285e9df924a',
      blockTime: 1
    },
  ];


// gets the most recent sends in the given time frame
async function checkEventsOnChain(chainName: string, client: any, contractAddress: string, blockTime: number, timeIntervalInMinutes: number): Promise<Log[] | null> {
    let logs: Log[] = [];
    try {
        // block time is in seconds
        const blocksInTimeFrame = (timeIntervalInMinutes * 60) / blockTime;
        const currentBlockNumber = await client.getBlockNumber();
        const blockOneDayAgo = BigInt(Number(currentBlockNumber) - blocksInTimeFrame);

        logs = await client.getLogs({
            address: contractAddress,
            event: parseAbiItem('event OFTSent(bytes32,uint32,address,uint256,uint256)'),
            fromBlock: blockOneDayAgo,
            toBlock: 'latest',
        });

        if (logs.length === 0) {
            return null;
        }
    } catch (error) {
        console.error(`Error fetching logs for ${chainName}:`, error);
        return null;
    }

    // Return the last 5 logs
    return logs.slice(-5); // Return the last 5 logs
}

// Monitor all chains and output the most recent events for each chain
async function monitorChains(timeIntervalInMinutes: number) {
    for (const { name, client, contractAddress, blockTime } of chains) {
        console.log(`Checking ${name}...`);
        let logs = await checkEventsOnChain(name, client, contractAddress, blockTime, timeIntervalInMinutes);

        if (logs && logs.length > 0) {
            logs.forEach(log => {
                console.log(`- Transaction Hash: ${log.transactionHash}`);
            });
        } else {
            console.log(`No cross chain sends from ${name} in this time frame.`);
        }
    }
}

// Get the time interval minutes from command line arguments
const timeIntervalInMinutes = process.argv[2] ? parseInt(process.argv[2], 10) : 60;

monitorChains(timeIntervalInMinutes);
