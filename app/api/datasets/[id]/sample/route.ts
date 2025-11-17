import { NextRequest, NextResponse } from 'next/server'
import { RedisService, RedisKeys } from '@/lib/database/redis'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const sampleData = await RedisService.get<any[]>(RedisKeys.DATASET_SAMPLE(id))
    
    if (!sampleData || sampleData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No sample data available for this dataset'
      })
    }

    const limitedData = sampleData.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedData,
      total: sampleData.length,
      returned: limitedData.length
    })
  } catch (error) {
    console.error('Error fetching sample data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample data' },
      { status: 500 }
    )
  }
}

