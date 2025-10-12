"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, ArrowUpDown, Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const sampleData = [
  {
    id: 1,
    timestamp: "2024-01-15 14:23:45",
    threat_type: "Malware",
    severity_score: 85,
    source_ip: "192.168.1.100",
    destination_ip: "10.0.0.50",
    bytes_transferred: 2048576,
    status: "Blocked",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:24:12",
    threat_type: "Phishing",
    severity_score: 72,
    source_ip: "203.0.113.45",
    destination_ip: "10.0.0.25",
    bytes_transferred: 1024000,
    status: "Flagged",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:25:03",
    threat_type: "DDoS",
    severity_score: 95,
    source_ip: "198.51.100.78",
    destination_ip: "10.0.0.10",
    bytes_transferred: 5242880,
    status: "Blocked",
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:26:18",
    threat_type: "Intrusion",
    severity_score: 68,
    source_ip: "172.16.0.200",
    destination_ip: "10.0.0.75",
    bytes_transferred: 512000,
    status: "Monitoring",
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:27:34",
    threat_type: "Malware",
    severity_score: 91,
    source_ip: "192.0.2.150",
    destination_ip: "10.0.0.30",
    bytes_transferred: 3145728,
    status: "Blocked",
  },
]

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

export function InteractiveDataTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = sampleData.filter((row) => {
    const matchesSearch = Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )
    const matchesFilter = filterType === "all" || row.threat_type.toLowerCase() === filterType.toLowerCase()
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
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
                Showing {sortedData.length} of {sampleData.length} records
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
                {sortedData.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{row.timestamp}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.threat_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(row.severity_score)}>{row.severity_score}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{row.source_ip}</TableCell>
                    <TableCell className="font-mono text-sm">{row.destination_ip}</TableCell>
                    <TableCell className="text-sm">{(row.bytes_transferred / 1024 / 1024).toFixed(2)} MB</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
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
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedData.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.ceil(sortedData.length / itemsPerPage) }, (_, i) => (
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
                onClick={() => setCurrentPage(Math.min(Math.ceil(sortedData.length / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
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
