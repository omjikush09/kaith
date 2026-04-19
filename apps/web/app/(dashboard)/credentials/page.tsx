"use client";

import { useState } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NodeIcon } from "@/components/workflow/node-icons";
import { toast } from "sonner";

type Credential = {
  id: string;
  name: string;
  service: string;
  createdAt: string;
};

const SERVICES = [
  { value: "slack", label: "Slack" },
  { value: "postgres", label: "Postgres" },
  { value: "http", label: "HTTP / API key" },
  { value: "email", label: "SMTP" },
];

const INITIAL: Credential[] = [
  {
    id: "c_1",
    name: "Production Slack",
    service: "slack",
    createdAt: "2026-03-12T10:00:00Z",
  },
  {
    id: "c_2",
    name: "Analytics DB",
    service: "postgres",
    createdAt: "2026-02-04T15:00:00Z",
  },
  {
    id: "c_3",
    name: "HubSpot API",
    service: "http",
    createdAt: "2026-01-20T08:30:00Z",
  },
];

export default function CredentialsPage() {
  const [creds, setCreds] = useState<Credential[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [service, setService] = useState<string>("slack");
  const [secret, setSecret] = useState("");

  const create = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setCreds((c) => [
      ...c,
      {
        id: `c_${Date.now()}`,
        name: name.trim(),
        service,
        createdAt: new Date().toISOString(),
      },
    ]);
    setName("");
    setSecret("");
    setOpen(false);
    toast.success("Credential added");
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="flex items-center justify-between border-b px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Credentials</h1>
          <p className="text-sm text-muted-foreground">
            Reusable secrets for connecting to external services.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              New credential
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New credential</DialogTitle>
              <DialogDescription>
                Stored encrypted. Reused by nodes that connect to this service.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cred-name">Name</Label>
                <Input
                  id="cred-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Slack"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Service</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="secret">Token / Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="••••••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={create}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid gap-4 p-8 sm:grid-cols-2 xl:grid-cols-3">
        {creds.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <NodeIcon
                    type={c.service}
                    className="h-4 w-4 text-foreground"
                  />
                </div>
                <div>
                  <CardTitle className="text-sm">{c.name}</CardTitle>
                  <CardDescription className="text-xs capitalize">
                    {c.service}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                <KeyRound className="size-3" /> encrypted
              </Badge>
            </CardHeader>
            <Separator />
            <CardContent className="flex items-center justify-between pt-4">
              <div className="text-xs text-muted-foreground">
                Created {new Date(c.createdAt).toLocaleDateString()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setCreds((cs) => cs.filter((x) => x.id !== c.id));
                  toast.success(`Removed "${c.name}"`);
                }}
              >
                <Trash2 />
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
