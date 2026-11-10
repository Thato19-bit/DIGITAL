import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./db"

export interface Block {
  index: number
  timestamp: string
  data: any
  previousHash: string
  hash: string
  nonce: number
  difficulty: number
}

export interface BlockchainState {
  chain: Block[]
  valid: boolean
  loading: boolean
}

const DIFFICULTY = 4

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  const bytes = Array.from(new Uint8Array(buf))
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function calculateHash(index: number, timestamp: string, data: any, previousHash: string, nonce: number): Promise<string> {
  return sha256(`${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`)
}

async function mineBlock(index: number, timestamp: string, data: any, previousHash: string, difficulty: number): Promise<{ hash: string; nonce: number }> {
  let nonce = 0
  let hash = await calculateHash(index, timestamp, data, previousHash, nonce)
  const prefix = "0".repeat(difficulty)
  while (!hash.startsWith(prefix)) {
    nonce += 1
    hash = await calculateHash(index, timestamp, data, previousHash, nonce)
  }
  return { hash, nonce }
}

export class Blockchain {
  chain: Block[] = []
  difficulty: number
  loading = false

  constructor(difficulty = DIFFICULTY) {
    this.difficulty = difficulty
  }

  async genesis(): Promise<Block> {
    const timestamp = new Date().toISOString()
    const hash = await sha256(`0${timestamp}genesis0`)
    return {
      index: 0,
      timestamp,
      data: "Genesis Block",
      previousHash: "0",
      hash,
      nonce: 0,
      difficulty: this.difficulty,
    }
  }

  async addBlock(data: any): Promise<Block> {
    const last = this.chain[this.chain.length - 1]
    const index = last ? last.index + 1 : 0
    const timestamp = new Date().toISOString()
    const previousHash = last ? last.hash : "0"
    const { hash, nonce } = await mineBlock(index, timestamp, data, previousHash, this.difficulty)
    const block: Block = { index, timestamp, data, previousHash, hash, nonce, difficulty: this.difficulty }
    this.chain.push(block)
    return block
  }

  async replaceChain(newChain: Block[]): Promise<void> {
    if (newChain.length <= this.chain.length) return
    if (!(await this.isValidChain(newChain))) throw new Error("Invalid chain")
    this.chain = newChain
  }

  async isValidChain(chain: Block[] = this.chain): Promise<boolean> {
    for (let i = 1; i < chain.length; i++) {
      const curr = chain[i]
      const prev = chain[i - 1]
      if (curr.previousHash !== prev.hash) return false
      const expected = await calculateHash(curr.index, curr.timestamp, curr.data, curr.previousHash, curr.nonce)
      if (curr.hash !== expected) return false
      const prefix = "0".repeat(this.difficulty)
      if (!curr.hash.startsWith(prefix)) return false
    }
    return true
  }

  getLastBlock(): Block | undefined {
    return this.chain[this.chain.length - 1]
  }

  async persist(block: Block): Promise<void> {
    await addDoc(collection(db, "blockchain"), {
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      hash: block.hash,
      nonce: block.nonce,
      difficulty: block.difficulty,
      createdAt: Timestamp.fromDate(new Date()),
    })
  }

  async loadFromFirestore(): Promise<Block[]> {
    const snap = await getDocs(query(collection(db, "blockchain"), orderBy("index", "asc")))
    const blocks: Block[] = snap.docs.map((d) => {
      const data = d.data()
      return {
        index: data.index,
        timestamp: data.timestamp,
        data: data.data,
        previousHash: data.previousHash,
        hash: data.hash,
        nonce: data.nonce,
        difficulty: data.difficulty,
      }
    })
    return blocks
  }
}

const blockchain = new Blockchain()

export { blockchain, DIFFICULTY }
