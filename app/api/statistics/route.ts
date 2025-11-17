import { NextRequest, NextResponse } from 'next/server'
import { pythonBackendClient } from '@/lib/api/python-backend-client'

// Mock statistical analysis data (fallback - only used if backend is unavailable)
const mockStatisticalResults = {
  descriptive: {
    summary: {
      count: 15420,
      mean: 45.67,
      std: 12.34,
      min: 1.0,
      max: 100.0,
      median: 44.2,
      q1: 35.8,
      q3: 55.1
    },
    distribution: {
      skewness: 0.23,
      kurtosis: 2.87,
      normality_test: {
        statistic: 0.987,
        p_value: 0.045,
        is_normal: false
      }
    },
    missing_values: {
      total: 234,
      percentage: 1.52,
      columns: [
        { column: 'user_agent', missing: 156, percentage: 1.01 },
        { column: 'threat_score', missing: 78, percentage: 0.51 }
      ]
    }
  },
  hypothesis: {
    tests: [
      {
        name: 'Two-Sample T-Test',
        description: 'Compare means between two groups',
        statistic: 2.34,
        p_value: 0.019,
        critical_value: 1.96,
        result: 'reject',
        conclusion: 'Significant difference between groups'
      },
      {
        name: 'Chi-Square Test',
        description: 'Test independence of categorical variables',
        statistic: 15.67,
        p_value: 0.003,
        critical_value: 9.49,
        result: 'reject',
        conclusion: 'Variables are not independent'
      },
      {
        name: 'Mann-Whitney U Test',
        description: 'Non-parametric comparison of two groups',
        statistic: 12450,
        p_value: 0.156,
        critical_value: 12000,
        result: 'fail_to_reject',
        conclusion: 'No significant difference between groups'
      }
    ]
  },
  correlation: {
    matrix: [
      [1.0, 0.45, -0.23, 0.67, 0.12],
      [0.45, 1.0, 0.34, 0.23, -0.45],
      [-0.23, 0.34, 1.0, -0.12, 0.56],
      [0.67, 0.23, -0.12, 1.0, 0.34],
      [0.12, -0.45, 0.56, 0.34, 1.0]
    ],
    features: ['packet_size', 'duration', 'port', 'protocol', 'threat_score'],
    significant_correlations: [
      { feature1: 'packet_size', feature2: 'duration', correlation: 0.67, p_value: 0.001 },
      { feature1: 'port', feature2: 'threat_score', correlation: 0.56, p_value: 0.003 },
      { feature1: 'duration', feature2: 'protocol', correlation: -0.45, p_value: 0.012 }
    ]
  },
  regression: {
    models: [
      {
        name: 'Linear Regression',
        r_squared: 0.742,
        adjusted_r_squared: 0.738,
        f_statistic: 45.67,
        p_value: 0.001,
        coefficients: [
          { feature: 'packet_size', coefficient: 0.234, std_error: 0.045, p_value: 0.001 },
          { feature: 'duration', coefficient: 0.189, std_error: 0.034, p_value: 0.003 },
          { feature: 'port', coefficient: -0.156, std_error: 0.023, p_value: 0.012 }
        ],
        residuals: {
          mean: 0.0,
          std: 2.34,
          min: -8.45,
          max: 7.23
        }
      }
    ]
  },
  distribution: {
    tests: [
      {
        name: 'Shapiro-Wilk Test',
        statistic: 0.987,
        p_value: 0.045,
        result: 'reject',
        conclusion: 'Data is not normally distributed'
      },
      {
        name: 'Kolmogorov-Smirnov Test',
        statistic: 0.123,
        p_value: 0.023,
        result: 'reject',
        conclusion: 'Data does not follow expected distribution'
      }
    ],
    histograms: {
      packet_size: {
        bins: [0, 500, 1000, 1500, 2000, 2500],
        frequencies: [1200, 3400, 5600, 3200, 1020]
      },
      duration: {
        bins: [0, 1, 2, 5, 10, 20],
        frequencies: [8900, 4200, 1800, 400, 120]
      }
    }
  },
  bayesian: {
    analyses: [
      {
        name: 'Bayesian Linear Regression',
        prior: 'Normal(0, 1)',
        posterior_mean: 0.234,
        posterior_std: 0.045,
        credible_interval: [0.145, 0.323],
        bayes_factor: 12.45,
        conclusion: 'Strong evidence for alternative hypothesis'
      },
      {
        name: 'Bayesian Hypothesis Testing',
        prior_probability: 0.5,
        posterior_probability: 0.89,
        bayes_factor: 8.1,
        conclusion: 'Strong evidence for hypothesis'
      }
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('datasetId')
    const columns = searchParams.get('columns')?.split(',').filter(Boolean)

    if (!datasetId) {
      return NextResponse.json(
        { success: false, error: 'datasetId is required' },
        { status: 400 }
      )
    }

    // Call Python backend API
    const response = await pythonBackendClient.getStatisticsSummary({
      dataset_id: datasetId,
      columns: columns,
    })

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    console.error('Error fetching statistical data:', error)
    // Fallback to mock data only if backend is unavailable
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('timeout')) {
      console.warn('Backend unavailable, returning mock data')
      return NextResponse.json({
        success: true,
        data: mockStatisticalResults,
        warning: 'Backend unavailable, showing mock data'
      })
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch statistical data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { datasetId, columns, options } = body

    if (!datasetId) {
      return NextResponse.json(
        { success: false, error: 'datasetId is required' },
        { status: 400 }
      )
    }

    // Call Python backend API for synchronous statistics summary
    const response = await pythonBackendClient.getStatisticsSummary({
      dataset_id: datasetId,
      columns: columns,
      options: options || {},
    })

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: any) {
    console.error('Error processing statistical analysis:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process statistical analysis' },
      { status: 500 }
    )
  }
}
