import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'

const dataFile = path.join(process.cwd(), 'data', 'pools.json')

type Pool = {
  token0: string
  token1: string
  fee: number
  pool: string
}

function readPools(): Pool[] {
  try {
    const data = fs.readFileSync(dataFile, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writePools(pools: Pool[]) {
  fs.writeFileSync(dataFile, JSON.stringify(pools, null, 2))
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const pools = readPools()
    res.status(200).json(pools)
    return
  }
  if (req.method === 'POST') {
    const pools = readPools()
    const pool: Pool = req.body
    pools.push(pool)
    writePools(pools)
    res.status(200).json({ success: true })
    return
  }
  res.status(405).end()
}
