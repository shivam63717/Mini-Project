import { NextRequest, NextResponse } from 'next/server'

// Mock data - in real app, this would come from database
const mockDatasets = [
  {
    id: '1',
    name: 'Cybersecurity Logs',
    description: 'Network security event logs from firewall and IDS systems',
    size: '2.4 MB',
    rows: 15420,
    columns: 12,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    tags: ['security', 'network', 'logs'],
    schema: [
      { name: 'timestamp', type: 'datetime', nullable: false },
      { name: 'source_ip', type: 'string', nullable: false },
      { name: 'dest_ip', type: 'string', nullable: false },
      { name: 'port', type: 'integer', nullable: false },
      { name: 'protocol', type: 'string', nullable: false },
      { name: 'action', type: 'string', nullable: false },
      { name: 'severity', type: 'string', nullable: true },
      { name: 'bytes_sent', type: 'integer', nullable: true },
      { name: 'bytes_received', type: 'integer', nullable: true },
      { name: 'duration', type: 'float', nullable: true },
      { name: 'user_agent', type: 'string', nullable: true },
      { name: 'threat_score', type: 'float', nullable: true }
    ],
    sampleData: [
      {
        timestamp: '2024-01-15T10:30:00Z',
        source_ip: '192.168.1.100',
        dest_ip: '10.0.0.5',
        port: 443,
        protocol: 'HTTPS',
        action: 'ALLOW',
        severity: 'LOW',
        bytes_sent: 1024,
        bytes_received: 2048,
        duration: 0.5,
        user_agent: 'Mozilla/5.0...',
        threat_score: 0.1
      },
      {
        timestamp: '2024-01-15T10:31:00Z',
        source_ip: '192.168.1.101',
        dest_ip: '10.0.0.5',
        port: 22,
        protocol: 'SSH',
        action: 'DENY',
        severity: 'HIGH',
        bytes_sent: 0,
        bytes_received: 0,
        duration: 0.0,
        user_agent: null,
        threat_score: 0.9
      }
    ]
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const dataset = mockDatasets.find(d => d.id === id)

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dataset
    })
  } catch (error) {
    console.error('Error fetching dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dataset' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description, tags } = body

    const datasetIndex = mockDatasets.findIndex(d => d.id === id)
    if (datasetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Update dataset
    mockDatasets[datasetIndex] = {
      ...mockDatasets[datasetIndex],
      name: name || mockDatasets[datasetIndex].name,
      description: description || mockDatasets[datasetIndex].description,
      tags: tags || mockDatasets[datasetIndex].tags,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: mockDatasets[datasetIndex]
    })
  } catch (error) {
    console.error('Error updating dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update dataset' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const datasetIndex = mockDatasets.findIndex(d => d.id === id)

    if (datasetIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }

    // Remove dataset
    mockDatasets.splice(datasetIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete dataset' },
      { status: 500 }
    )
  }
}
