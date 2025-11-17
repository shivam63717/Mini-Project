import { NextRequest, NextResponse } from 'next/server'
import { pythonBackendClient } from '@/lib/api/python-backend-client'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const experiment = await pythonBackendClient.getExperiment(id)

        return NextResponse.json({
            success: true,
            data: experiment
        })
    } catch (error: any) {
        console.error('Error fetching experiment:', error)
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return NextResponse.json(
                { success: false, error: 'Experiment not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch experiment' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await request.json()
        const { name, algorithm, hyperparameters, status } = body

        const updatedExperiment = await pythonBackendClient.updateExperiment(id, {
            name,
            algorithm,
            hyperparameters,
            status: status as any,
        })

        return NextResponse.json({
            success: true,
            data: updatedExperiment
        })
    } catch (error: any) {
        console.error('Error updating experiment:', error)
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return NextResponse.json(
                { success: false, error: 'Experiment not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update experiment' },
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
        await pythonBackendClient.deleteExperiment(id)

        return NextResponse.json({
            success: true,
            message: 'Experiment deleted successfully'
        }, { status: 204 })
    } catch (error: any) {
        console.error('Error deleting experiment:', error)
        if (error.message?.includes('404') || error.message?.includes('not found')) {
            return NextResponse.json(
                { success: false, error: 'Experiment not found' },
                { status: 404 }
            )
        }
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete experiment' },
            { status: 500 }
        )
    }
}

