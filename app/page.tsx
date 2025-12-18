import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Topbar from "@/components/Topbar";

export default function Home() {
  return (
    <>
      <Topbar title="Welcome" />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">AstraSemi Assistant</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your friendly AI assistant for semiconductor operations. 
              Get clear, simple explanations and actionable insights for your daily work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Operations Dashboard</CardTitle>
            <CardDescription>
              Upload CSV files and get instant summaries of your operations data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Open Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Document Interpreter</CardTitle>
            <CardDescription>
              Understand technical documents and get clear summaries with follow-up actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/interpreter">
              <Button className="w-full">Open Interpreter</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Image Identifier</CardTitle>
            <CardDescription>
              Upload images to identify semiconductor components and understand their purpose
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/image-id">
              <Button className="w-full">Open Image ID</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Role Briefing Hub</CardTitle>
            <CardDescription>
              Get personalized daily briefings based on your role and tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/role-briefing">
              <Button className="w-full" variant="outline">Open Briefing Hub</Button>
            </Link>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </>
  );
}

