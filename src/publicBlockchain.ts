// Public blockchain connector (Ethereum testnets: Sepolia / Mumbai).
// Uses bare fetch JSON-RPC — no npm install required.
// To transact for real, supply your own RPC URL, private key, and deployed contract address.
const DEFAULT_RPC = "https://rpc.sepolia.org"

export class PublicBlockchain {
  rpcUrl: string
  contractAddress: string | null
  constructor(rpcUrl = DEFAULT_RPC, contractAddress = null) {
    this.rpcUrl = rpcUrl
    this.contractAddress = contractAddress
  }

  async call(method: string, params: any[] = []): Promise<any> {
    const res = await fetch(this.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    return json.result
  }

  async getBlockNumber(): Promise<number> {
    const hex = await this.call("eth_blockNumber")
    return parseInt(hex, 16)
  }

  async getBalance(address: string): Promise<string> {
    const hex = await this.call("eth_getBalance", [address, "latest"])
    return hex
  }

  async getCode(address: string): Promise<string> {
    return this.call("eth_getCode", [address, "latest"])
  }

  async isContractDeployed(): Promise<boolean> {
    if (!this.contractAddress) return false
    const code = await this.getCode(this.contractAddress)
    return code && code !== "0x" && code.length > 2
  }
}

export const publicBlockchain = new PublicBlockchain()
