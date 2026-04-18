"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState("Personal workspace");
  const [email, setEmail] = useState("omjimaurya09@gmail.com");
  const [webhookBase, setWebhookBase] = useState(
    "https://kaith.example.com/webhook",
  );
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="border-b px-8 py-5">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace and account preferences.
        </p>
      </header>

      <div className="px-8 py-6">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace</CardTitle>
                <CardDescription>
                  General information about your workspace.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="ws-name">Workspace name</Label>
                  <Input
                    id="ws-name"
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ws-tz">Timezone</Label>
                  <Input id="ws-tz" defaultValue="UTC" />
                </div>
                <div className="flex justify-end">
                  <Button size="sm">
                    <Save />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6 max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account details.</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="A few words about yourself"
                  />
                </div>
                <div className="flex justify-end">
                  <Button size="sm">
                    <Save />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-6 max-w-2xl space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>API & Webhooks</CardTitle>
                  <CardDescription>
                    Endpoints used by webhook triggers.
                  </CardDescription>
                </div>
                <Badge variant="secondary">live</Badge>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                  <Label htmlFor="hook">Webhook base URL</Label>
                  <Input
                    id="hook"
                    value={webhookBase}
                    onChange={(e) => setWebhookBase(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="key">API key</Label>
                  <Input
                    id="key"
                    type="password"
                    defaultValue="kth_live_••••••••••••"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to authenticate API requests. Rotate from the CLI.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6 max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Choose how Kaith looks on this device.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        theme === t
                          ? "border-primary ring-2 ring-primary/20"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="text-sm font-medium capitalize">{t}</div>
                      <div className="text-xs text-muted-foreground">
                        {t === "system" ? "Match OS" : `${t} mode`}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
