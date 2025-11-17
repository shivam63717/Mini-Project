import { NextRequest, NextResponse } from 'next/server'
import { pythonBackendClient } from '@/lib/api/python-backend-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const dataset = await pythonBackendClient.getDataset(id)

    return NextResponse.json({
      success: true,
      data: dataset
    })
  } catch (error: any) {
    console.error('Error fetching dataset:', error)
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dataset' },
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
    const { name, description, schema, row_count, source } = body

    const updatedDataset = await pythonBackendClient.updateDataset(id, {
      name,
      description,
      schema,
      row_count,
      source: source as any,
    })

    return NextResponse.json({
      success: true,
      data: updatedDataset
    })
  } catch (error: any) {
    console.error('Error updating dataset:', error)
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update dataset' },
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
    await pythonBackendClient.deleteDataset(id)

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully'
    }, { status: 204 })
  } catch (error: any) {
    console.error('Error deleting dataset:', error)
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete dataset' },
      { status: 500 }
    )
  }
}
