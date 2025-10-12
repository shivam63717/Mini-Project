
export interface QueryOptions {
  page: number
  pageSize: number
  sort?: string
  order?: 'asc' | 'desc'
  filters: Record<string, string | number | boolean>
}

export function parseQuery(query: any): QueryOptions {
  const page = Math.max(1, parseInt(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20))
  const sort = query.sort
  const order = query.order === 'desc' ? 'desc' : 'asc'
  const filters: Record<string, any> = {}
  Object.keys(query).forEach(k => {
    if (!['page','pageSize','sort','order'].includes(k)) filters[k] = query[k]
  })
  return { page, pageSize, sort, order, filters }
}

export function buildPrismaArgs(opts: QueryOptions) {
  const skip = (opts.page - 1) * opts.pageSize
  const take = opts.pageSize
  const orderBy = opts.sort ? { [opts.sort]: opts.order } : undefined
  const where = Object.keys(opts.filters).length ? opts.filters : undefined
  return { skip, take, where, orderBy }
}