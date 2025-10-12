import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { DataProfiler } from "@/components/data-explorer/data-profiler"
import { CorrelationMatrix } from "@/components/data-explorer/correlation-matrix"
import { DistributionAnalysis } from "@/components/data-explorer/distribution-analysis"
import { DataQualityAssessment } from "@/components/data-explorer/data-quality-assessment"
import { InteractiveDataTable } from "@/components/data-explorer/interactive-data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DataExplorerPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Data Explorer" subtitle="Comprehensive exploratory data analysis and data profiling tools" />

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="correlations">Correlations</TabsTrigger>
              <TabsTrigger value="distributions">Distributions</TabsTrigger>
              <TabsTrigger value="quality">Data Quality</TabsTrigger>
              <TabsTrigger value="table">Data Table</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <DataProfiler />
            </TabsContent>

            <TabsContent value="correlations" className="space-y-6">
              <CorrelationMatrix />
            </TabsContent>

            <TabsContent value="distributions" className="space-y-6">
              <DistributionAnalysis />
            </TabsContent>

            <TabsContent value="quality" className="space-y-6">
              <DataQualityAssessment />
            </TabsContent>

            <TabsContent value="table" className="space-y-6">
              <InteractiveDataTable />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
