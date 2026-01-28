// Mock Prisma client using sql.js for SQLite
import initSqlJs, { Database } from 'sql.js'
import * as fs from 'fs'
import * as path from 'path'

let db: Database | null = null
let dbPromise: Promise<Database> | null = null

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

async function getDb(): Promise<Database> {
  if (db) return db
  if (dbPromise) return dbPromise

  dbPromise = (async () => {
    const SQL = await initSqlJs()

    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath)
      db = new SQL.Database(buffer)
    } else {
      db = new SQL.Database()
    }

    return db
  })()

  return dbPromise
}

function saveDb() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function rowToObject(columns: string[], values: any[]): any {
  const obj: any = {}
  columns.forEach((col, i) => {
    obj[col] = values[i]
  })
  return obj
}

// Create model proxy for CRUD operations
function createModel(tableName: string) {
  return {
    async findUnique({ where }: { where: any }) {
      const database = await getDb()
      const keys = Object.keys(where)
      const conditions = keys.map(k => `${k} = ?`).join(' AND ')
      const values = keys.map(k => where[k])

      const result = database.exec(`SELECT * FROM ${tableName} WHERE ${conditions} LIMIT 1`, values)
      if (result.length === 0 || result[0].values.length === 0) return null

      return rowToObject(result[0].columns, result[0].values[0])
    },

    async findFirst({ where, orderBy }: { where?: any; orderBy?: any } = {}) {
      const database = await getDb()
      let query = `SELECT * FROM ${tableName}`
      const values: any[] = []

      if (where) {
        const keys = Object.keys(where)
        if (keys.length > 0) {
          const conditions = keys.map(k => `${k} = ?`).join(' AND ')
          query += ` WHERE ${conditions}`
          keys.forEach(k => values.push(where[k]))
        }
      }

      if (orderBy) {
        const orderKeys = Object.keys(orderBy)
        if (orderKeys.length > 0) {
          const orders = orderKeys.map(k => `${k} ${orderBy[k] === 'desc' ? 'DESC' : 'ASC'}`)
          query += ` ORDER BY ${orders.join(', ')}`
        }
      }

      query += ' LIMIT 1'

      const result = database.exec(query, values)
      if (result.length === 0 || result[0].values.length === 0) return null

      return rowToObject(result[0].columns, result[0].values[0])
    },

    async findMany({ where, orderBy, include }: { where?: any; orderBy?: any; include?: any } = {}) {
      const database = await getDb()
      let query = `SELECT * FROM ${tableName}`
      const values: any[] = []

      if (where) {
        const keys = Object.keys(where)
        if (keys.length > 0) {
          const conditions = keys.map(k => `${k} = ?`).join(' AND ')
          query += ` WHERE ${conditions}`
          keys.forEach(k => values.push(where[k]))
        }
      }

      if (orderBy) {
        const orderKeys = Object.keys(orderBy)
        if (orderKeys.length > 0) {
          const orders = orderKeys.map(k => `${k} ${orderBy[k] === 'desc' ? 'DESC' : 'ASC'}`)
          query += ` ORDER BY ${orders.join(', ')}`
        }
      }

      const result = database.exec(query, values)
      if (result.length === 0) return []

      return result[0].values.map(row => rowToObject(result[0].columns, row))
    },

    async create({ data }: { data: any }) {
      const database = await getDb()
      const id = data.id || uuid()
      const now = new Date().toISOString()

      const finalData = {
        id,
        createdAt: now,
        updatedAt: now,
        ...data,
      }

      const keys = Object.keys(finalData)
      const placeholders = keys.map(() => '?').join(', ')
      const values = keys.map(k => {
        const v = finalData[k]
        if (typeof v === 'boolean') return v ? 1 : 0
        if (v instanceof Date) return v.toISOString()
        return v
      })

      database.run(
        `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
        values
      )
      saveDb()

      return finalData
    },

    async update({ where, data }: { where: any; data: any }) {
      const database = await getDb()
      const now = new Date().toISOString()

      const updateData = { ...data, updatedAt: now }
      const setKeys = Object.keys(updateData)
      const setClauses = setKeys.map(k => `${k} = ?`).join(', ')
      const setValues = setKeys.map(k => {
        const v = updateData[k]
        if (typeof v === 'boolean') return v ? 1 : 0
        if (v instanceof Date) return v.toISOString()
        return v
      })

      const whereKeys = Object.keys(where)
      const whereClauses = whereKeys.map(k => `${k} = ?`).join(' AND ')
      const whereValues = whereKeys.map(k => where[k])

      database.run(
        `UPDATE ${tableName} SET ${setClauses} WHERE ${whereClauses}`,
        [...setValues, ...whereValues]
      )
      saveDb()

      // Return updated record
      return this.findUnique({ where })
    },

    async upsert({ where, create, update }: { where: any; create: any; update: any }) {
      const existing = await this.findUnique({ where })
      if (existing) {
        return this.update({ where, data: update })
      } else {
        return this.create({ data: { ...where, ...create } })
      }
    },

    async delete({ where }: { where: any }) {
      const database = await getDb()
      const record = await this.findUnique({ where })

      const keys = Object.keys(where)
      const conditions = keys.map(k => `${k} = ?`).join(' AND ')
      const values = keys.map(k => where[k])

      database.run(`DELETE FROM ${tableName} WHERE ${conditions}`, values)
      saveDb()

      return record
    },

    async count({ where }: { where?: any } = {}) {
      const database = await getDb()
      let query = `SELECT COUNT(*) as count FROM ${tableName}`
      const values: any[] = []

      if (where) {
        const keys = Object.keys(where)
        if (keys.length > 0) {
          const conditions = keys.map(k => `${k} = ?`).join(' AND ')
          query += ` WHERE ${conditions}`
          keys.forEach(k => values.push(where[k]))
        }
      }

      const result = database.exec(query, values)
      if (result.length === 0) return 0

      return result[0].values[0][0] as number
    },
  }
}

// Mock PrismaClient
export const prisma = {
  user: createModel('User'),
  education: createModel('Education'),
  workHistory: createModel('WorkHistory'),
  qualification: createModel('Qualification'),
  skill: createModel('Skill'),
  desiredCondition: createModel('DesiredCondition'),
  reviewer: createModel('Reviewer'),
  evaluation: createModel('Evaluation'),
  publicUrl: createModel('PublicUrl'),
  adminAction: createModel('AdminAction'),
}

export type PrismaClient = typeof prisma
