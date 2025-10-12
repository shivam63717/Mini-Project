"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Code, Play, Download, Eye, Hash } from "lucide-react"

const encodingMethods = [
  {
    name: "One-Hot Encoding",
    description: "Create binary columns for each category",
    useCase: "Nominal categories, few unique values",
    pros: ["No ordinal assumption", "Works with all algorithms"],
    cons: ["High dimensionality", "Sparse matrices"],
    recommended: true,
  },
  {
    name: "Label Encoding",
    description: "Assign integer labels to categories",
    useCase: "Ordinal categories, many unique values",
    pros: ["Low memory usage", "Fast processing"],
    cons: ["Implies order", "May mislead algorithms"],
    recommended: false,
  },
  {
    name: "Target Encoding",
    description: "Replace categories with target mean",
    useCase: "High cardinality, regression tasks",
    pros: ["Reduces dimensionality", "Captures target relationship"],
    cons: ["Risk of overfitting", "Requires validation"],
    recommended: true,
  },
  {
    name: "Frequency Encoding",
    description: "Replace with category frequency",
    useCase: "Categories with meaningful frequency",
    pros: ["Simple implementation", "Preserves information"],
    cons: ["May lose category identity", "Frequency bias"],
    recommended: false,
  },
]

const categoricalFeatures = [
  {
    feature: "threat_type",
    uniqueValues: 8,
    topValues: ["Malware", "Phishing", "DDoS", "Intrusion"],
    nullCount: 25,
    encoding: "one-hot",
    selected: true,
  },
  {
    feature: "source_country",
    uniqueValues: 45,
    topValues: ["US", "CN", "RU", "DE"],
    nullCount: 1250,
    encoding: "target",
    selected: true,
  },
  {
    feature: "protocol",
    uniqueValues: 6,
    topValues: ["TCP", "UDP", "HTTP", "HTTPS"],
    nullCount: 0,
    encoding: "one-hot",
    selected: true,
  },
  {
    feature: "user_agent_category",
    uniqueValues: 12,
    topValues: ["Browser", "Bot", "Mobile", "API"],
    nullCount: 890,
    encoding: "label",
    selected: false,
  },
]

const encodingPreview = {
  threat_type: {
    original: ["Malware", "Phishing", "DDoS", "Malware", "Intrusion"],
    "one-hot": {
      threat_type_Malware: [1, 0, 0, 1, 0],
      threat_type_Phishing: [0, 1, 0, 0, 0],
      threat_type_DDoS: [0, 0, 1, 0, 0],
      threat_type_Intrusion: [0, 0, 0, 0, 1],
    },
    label: [0, 1, 2, 0, 3],
    target: [0.85, 0.72, 0.91, 0.85, 0.68],
  },
}

export function EncodingTools() {
  const [selectedMethod, setSelectedMethod] = useState("one-hot")
  const [isEncoding, setIsEncoding] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFeature, setPreviewFeature] = useState("threat_type")

  const handleFeatureToggle = (featureName: string) => {
    console.log(`Toggling encoding for: ${featureName}`)
  }

  const runEncoding = () => {
    setIsEncoding(true)
    setTimeout(() => {
      setIsEncoding(false)
      setShowPreview(true)
    }, 2000)
  }

  const selectedFeatures = categoricalFeatures.filter((f) => f.selected)

  return (
    <div className="space-y-6">
      {/* Encoding Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Categorical Encoding Methods
          </CardTitle>
          <CardDescription>Transform categorical variables into numerical representations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {encodingMethods.map((method) => (
              <div
                key={method.name}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethod === method.name.toLowerCase().replace(/[^a-z]/g, "-")
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedMethod(method.name.toLowerCase().replace(/[^a-z]/g, "-"))}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{method.name}</h3>
                  {method.recommended && (
                    <Badge variant="default" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <div className="text-xs text-muted-foreground mb-2">Best for: {method.useCase}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-success font-medium">Pros:</div>
                    <ul className="text-success/80 space-y-1">
                      {method.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-destructive font-medium">Cons:</div>
                    <ul className="text-destructive/80 space-y-1">
                      {method.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorical Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categorical Features</CardTitle>
              <CardDescription>Select features to encode and choose encoding methods</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button onClick={runEncoding} disabled={isEncoding || selectedFeatures.length === 0}>
                {isEncoding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Encoding...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Apply Encoding
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoricalFeatures.map((feature, index) => (
              <div
                key={feature.feature}
                className={`p-4 rounded-lg border transition-all ${
                  feature.selected ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={feature.selected} onCheckedChange={() => handleFeatureToggle(feature.feature)} />
                    <div>
                      <h4 className="font-medium text-foreground">{feature.feature}</h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.uniqueValues} unique values, {feature.nullCount} nulls
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue={feature.encoding}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-hot">One-Hot</SelectItem>
                        <SelectItem value="label">Label</SelectItem>
                        <SelectItem value="target">Target</SelectItem>
                        <SelectItem value="frequency">Frequency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-sm text-muted-foreground">Top values:</span>
                    {feature.topValues.map((value) => (
                      <Badge key={value} variant="outline" className="text-xs">
                        {value}
                      </Badge>
                    ))}
                    {feature.uniqueValues > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{feature.uniqueValues - 4} more
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant={
                      feature.uniqueValues > 20 ? "destructive" : feature.uniqueValues > 10 ? "default" : "secondary"
                    }
                  >
                    {feature.uniqueValues > 20
                      ? "High cardinality"
                      : feature.uniqueValues > 10
                        ? "Medium cardinality"
                        : "Low cardinality"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encoding Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Encoding Preview
                </CardTitle>
                <CardDescription>Preview of how categorical values will be encoded</CardDescription>
              </div>
              <Select value={previewFeature} onValueChange={setPreviewFeature}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoricalFeatures.map((feature) => (
                    <SelectItem key={feature.feature} value={feature.feature}>
                      {feature.feature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Original Values */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Original Values</h4>
                <div className="flex gap-2">
                  {encodingPreview[previewFeature as keyof typeof encodingPreview]?.original.map((value, i) => (
                    <Badge key={i} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* One-Hot Encoding */}
              <div>
                <h4 className="font-medium text-foreground mb-2">One-Hot Encoding</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Index</TableHead>
                        {Object.keys(
                          encodingPreview[previewFeature as keyof typeof encodingPreview]?.["one-hot"] || {},
                        ).map((col) => (
                          <TableHead key={col} className="text-xs">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 5 }, (_, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{i}</TableCell>
                          {Object.values(
                            encodingPreview[previewFeature as keyof typeof encodingPreview]?.["one-hot"] || {},
                          ).map((values: any, j) => (
                            <TableCell key={j} className="text-center">
                              <Badge variant={values[i] === 1 ? "default" : "outline"} className="text-xs">
                                {values[i]}
                              </Badge>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Other Encodings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Label Encoding</h4>
                  <div className="flex gap-2">
                    {encodingPreview[previewFeature as keyof typeof encodingPreview]?.label.map((value, i) => (
                      <Badge key={i} variant="secondary">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">Target Encoding</h4>
                  <div className="flex gap-2">
                    {encodingPreview[previewFeature as keyof typeof encodingPreview]?.target.map((value, i) => (
                      <Badge key={i} variant="default">
                        {value.toFixed(2)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-info">Encoding Summary</h4>
                  <p className="text-sm text-info/80">
                    One-hot encoding will create{" "}
                    {
                      Object.keys(encodingPreview[previewFeature as keyof typeof encodingPreview]?.["one-hot"] || {})
                        .length
                    }{" "}
                    new columns
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
