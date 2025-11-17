"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, ArrowUpDown, Eye, MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface InteractiveDataTableProps {
  datasetId?: string
}

function getSeverityColor(score: number) {
  if (score >= 90) return "destructive"
  if (score >= 70) return "default"
  if (score >= 50) return "secondary"
  return "outline"
}

function getStatusColor(status: string) {
  switch (status) {
    case "Blocked":
      return "destructive"
    case "Flagged":
      return "default"
    case "Monitoring":
      return "secondary"
    default:
      return "outline"
  }
}

export function InteractiveDataTable({ datasetId }: InteractiveDataTableProps = {}) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      if (!datasetId) {
        try {
          const datasetsResponse = await fetch('/api/datasets?limit=1')
          const datasetsResult = await datasetsResponse.json()
          if (datasetsResult.success && datasetsResult.data.length > 0) {
            const firstDatasetId = datasetsResult.data[0].id
            await loadSampleData(firstDatasetId)
          } else {
            setData([])
            setLoading(false)
          }
        } catch (err) {
          console.error('Error fetching datasets:', err)
          setError('Failed to load datasets')
          setLoading(false)
        }
      } else {
        await loadSampleData(datasetId)
      }
    }

    fetchData()
  }, [datasetId])

  const loadSampleData = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/datasets/${id}/sample?limit=1000`)
      const result = await response.json()
      if (result.success) {
        setData(result.data || [])
      } else {
        setError(result.error || 'Failed to load data')
        setData([])
      }
    } catch (err) {
      console.error('Error fetching sample data:', err)
      setError('Failed to load sample data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter((row) => {
    const matchesSearch = Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const threatType = row.threat_type || row.type || row.category || ''
    const matchesFilter = filterType === "all" || threatType.toString().toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = sortedData.slice(startIndex, endIndex)

  // Reset to page 1 if current page is out of bounds
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
    // Reset to first page when sorting changes
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Interactive Data Table
              </CardTitle>
              <CardDescription>Browse, search, and filter your cybersecurity data</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search across all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by threat type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Threats</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="ddos">DDoS</SelectItem>
                <SelectItem value="intrusion">Intrusion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Records</CardTitle>
              <CardDescription>
                Showing {sortedData.length} of {data.length} records
                {datasetId && ` (Dataset: ${datasetId})`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading data...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center py-12">
              <span className="text-destructive">{error}</span>
            </div>
          )}
          {!loading && !error && data.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground">No data available. Please upload a dataset first.</span>
            </div>
          )}
          {!loading && !error && data.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("timestamp")}
                      className="h-auto p-0 font-medium"
                    >
                      Timestamp
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("threat_type")}
                      className="h-auto p-0 font-medium"
                    >
                      Threat Type
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("severity_score")}
                      className="h-auto p-0 font-medium"
                    >
                      Severity
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Source IP</TableHead>
                  <TableHead>Destination IP</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort("bytes_transferred")}
                      className="h-auto p-0 font-medium"
                    >
                      Bytes
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => {
                  const timestamp = row.timestamp || row.date || row.time || ''
                  const threatType = row.threat_type || row.type || row.category || 'Unknown'
                  const severityScore = row.severity_score || row.score || row.severity || 0
                  const sourceIp = row.source_ip || row.source || row.ip || ''
                  const destIp = row.destination_ip || row.destination || row.target || ''
                  const bytes = row.bytes_transferred || row.bytes || row.size || 0
                  const status = row.status || row.state || 'Unknown'
                  
                  return (
                    <TableRow key={row.id || index} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-muted-foreground">{startIndex + index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{threatType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(Number(severityScore))}>{severityScore}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{sourceIp}</TableCell>
                      <TableCell className="font-mono text-sm">{destIp}</TableCell>
                      <TableCell className="text-sm">{typeof bytes === 'number' ? (bytes / 1024 / 1024).toFixed(2) + ' MB' : bytes}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(status)}>{status}</Badge>
                      </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Record</DropdownMenuItem>
                          <DropdownMenuItem>Export Row</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {sortedData.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(endIndex, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || totalPages === 0}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-8 h-8 p-0"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
