"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Package,
  FileText,
  Upload,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { dataStore } from "@/lib/data-store"
import { PLAN_DETAILS } from "@/lib/types"

export default function CreateClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    plan: "" as "basic" | "standard" | "premium" | "",
    msaFile: "",
    assetsFile: ""
  })

  const handleFileChange = (field: "msaFile" | "assetsFile") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file.name
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const session = auth.getSession()
      if (!session) {
        router.push("/manager/login")
        return
      }

      const client = dataStore.createClient({
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        plan: formData.plan as "basic" | "standard" | "premium",
        msaFile: formData.msaFile,
        assetsFile: formData.assetsFile,
        createdBy: session.email
      })

      setSuccess(true)

      // Redirect to client details after 2 seconds
      setTimeout(() => {
        router.push(`/manager/client/${client.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error creating client:", error)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.businessName &&
      formData.ownerName &&
      formData.email &&
      formData.phone &&
      formData.plan
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/manager/dashboard"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Client</CardTitle>
            <CardDescription>
              Add a new client and automatically generate their project tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Client created successfully! Redirecting to client details...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., Raj's Restaurant"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="e.g., Raj Kumar"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="raj@restaurant.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Plan
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="plan">Service Plan *</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value) => setFormData({ ...formData, plan: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">
                        Basic ({PLAN_DETAILS.basic.posts} posts + {PLAN_DETAILS.basic.videos} videos)
                      </SelectItem>
                      <SelectItem value="standard">
                        Standard ({PLAN_DETAILS.standard.posts} posts + {PLAN_DETAILS.standard.videos} videos)
                      </SelectItem>
                      <SelectItem value="premium">
                        Premium ({PLAN_DETAILS.premium.posts} posts + {PLAN_DETAILS.premium.videos} videos)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.plan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>{formData.plan.toUpperCase()} Plan</strong> will automatically generate:
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• {PLAN_DETAILS[formData.plan as keyof typeof PLAN_DETAILS].posts} social media posts</li>
                      <li>• {PLAN_DETAILS[formData.plan as keyof typeof PLAN_DETAILS].videos} AI videos (5 stages each)</li>
                      <li>• Automatic CCT team assignment</li>
                      <li>• Monthly project tracking</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* File Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="msa">MSA Document</Label>
                    <div className="relative">
                      <Input
                        id="msa"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange("msaFile")}
                        className="cursor-pointer"
                      />
                      {formData.msaFile && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {formData.msaFile}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assets">Assets Package</Label>
                    <div className="relative">
                      <Input
                        id="assets"
                        type="file"
                        accept=".zip,.rar"
                        onChange={handleFileChange("assetsFile")}
                        className="cursor-pointer"
                      />
                      {formData.assetsFile && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {formData.assetsFile}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid() || loading || success}
                  className="flex-1"
                >
                  {loading ? (
                    "Creating Client..."
                  ) : success ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Client Created!
                    </>
                  ) : (
                    "Create Client & Generate Tasks"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/manager/dashboard")}
                  disabled={loading || success}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}