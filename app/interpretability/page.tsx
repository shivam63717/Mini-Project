import { Sidebar } from "@/components/navigation/sidebar"
import { Header } from "@/components/navigation/header"
import { ShapAnalysis } from "@/components/interpretability/shap-analysis"
import { LimeExplanations } from "@/components/interpretability/lime-explanations"
import { PartialDependencePlots } from "@/components/interpretability/partial-dependence-plots"
import { FeatureInteractions } from "@/components/interpretability/feature-interactions"
import { ModelDecisionPaths } from "@/components/interpretability/model-decision-paths"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InterpretabilityPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Model Interpretability"
          subtitle="Understand and explain your machine learning model predictions"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="shap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="shap">SHAP Analysis</TabsTrigger>
              <TabsTrigger value="lime">LIME</TabsTrigger>
              <TabsTrigger value="pdp">Partial Dependence</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="decisions">Decision Paths</TabsTrigger>
            </TabsList>

            <TabsContent value="shap" className="space-y-6">
              <ShapAnalysis />
            </TabsContent>

            <TabsContent value="lime" className="space-y-6">
              <LimeExplanations />
            </TabsContent>

            <TabsContent value="pdp" className="space-y-6">
              <PartialDependencePlots />
            </TabsContent>

            <TabsContent value="interactions" className="space-y-6">
              <FeatureInteractions />
            </TabsContent>

            <TabsContent value="decisions" className="space-y-6">
              <ModelDecisionPaths />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
