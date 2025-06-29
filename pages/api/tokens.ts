import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

const dataFile = path.join(process.cwd(), 'data', 'tokens.json')

type Token = {
  symbol: string
  address: string
  decimals: number
}

function readTokens(): Token[] {
  try {
    const data = fs.readFileSync(dataFile, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeTokens(tokens: Token[]) {
  fs.writeFileSync(dataFile, JSON.stringify(tokens, null, 2))
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const tokens = readTokens()
    res.status(200).json(tokens)
    return
  }
  if (req.method === 'POST') {
    const tokens = readTokens()
    const token: Token = req.body
    tokens.push(token)
    writeTokens(tokens)
    res.status(200).json({ success: true })
    return
  }
  res.status(405).end()
}
