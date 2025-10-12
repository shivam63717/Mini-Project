import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { FeatureGenerator } from "@/components/features/feature-generator"
import { FeatureImportance } from "@/components/features/feature-importance"
import { FeatureSelection } from "@/components/features/feature-selection"
import { FeatureScaling } from "@/components/features/feature-scaling"
import { EncodingTools } from "@/components/features/encoding-tools"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeaturesPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Feature Engineering"
          subtitle="Advanced tools for feature creation, selection, and transformation"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="generator" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="importance">Importance</TabsTrigger>
              <TabsTrigger value="selection">Selection</TabsTrigger>
              <TabsTrigger value="scaling">Scaling</TabsTrigger>
              <TabsTrigger value="encoding">Encoding</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <FeatureGenerator />
            </TabsContent>

            <TabsContent value="importance" className="space-y-6">
              <FeatureImportance />
            </TabsContent>

            <TabsContent value="selection" className="space-y-6">
              <FeatureSelection />
            </TabsContent>

            <TabsContent value="scaling" className="space-y-6">
              <FeatureScaling />
            </TabsContent>

            <TabsContent value="encoding" className="space-y-6">
              <EncodingTools />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
