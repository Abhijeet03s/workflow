"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCircle, Users, Building2 } from "lucide-react"
import Link from "next/link"
import { checkAndSeedData } from "@/lib/seed-data"

export default function RoleSelectionPage() {
  useEffect(() => {
    // Initialize seed data if needed
    checkAndSeedData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Workflow Management System</h1>
          <p className="text-xl text-gray-600">Select your portal to continue</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Manager Portal */}
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Client Manager Portal</CardTitle>
              <CardDescription className="mt-2">
                Manage clients, create projects, and monitor progress
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Features:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Create and manage clients</li>
                    <li>• Assign plans and generate tasks</li>
                    <li>• Monitor project progress</li>
                    <li>• View all team assignments</li>
                  </ul>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/manager/login">
                  Access Manager Portal
                </Link>
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Login: manager@company.com / manager123
              </p>
            </CardContent>
          </Card>

          {/* CCT Portal */}
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">CCT Team Portal</CardTitle>
              <CardDescription className="mt-2">
                View tasks, update status, and manage deliveries
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Features:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• View assigned tasks</li>
                    <li>• Set delivery dates</li>
                    <li>• Update task status</li>
                    <li>• Manage video stages</li>
                  </ul>
                </div>
              </div>
              <Button asChild className="w-full" size="lg" variant="secondary">
                <Link href="/cct/login">
                  Access CCT Portal
                </Link>
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Example: priya@company.com / cct123
              </p>
            </CardContent>
          </Card>

          {/* Client Portal */}
          <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-10 w-10 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Client Portal</CardTitle>
              <CardDescription className="mt-2">
                Track your project progress and download content
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Features:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• View project progress</li>
                    <li>• Track deliverables</li>
                    <li>• Download completed content</li>
                    <li>• See delivery timelines</li>
                  </ul>
                </div>
              </div>
              <Button asChild className="w-full" size="lg" variant="outline">
                <Link href="/client/login">
                  Access Client Portal
                </Link>
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Example: raj@restaurant.com / client123
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            This is a demonstration system with sample data. All data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  )
}