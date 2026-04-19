"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createWorkflow } from "@/lib/api";
import { useSession } from "@/lib/auth-client";

const ADJECTIVES = [
  "Brave",
  "Calm",
  "Clever",
  "Curious",
  "Eager",
  "Gentle",
  "Lucky",
  "Mighty",
  "Quiet",
  "Quick",
  "Silent",
  "Swift",
  "Wild",
  "Witty",
  "Bright",
  "Bold",
];

const NOUNS = [
  "Falcon",
  "Forest",
  "River",
  "Comet",
  "Ember",
  "Harbor",
  "Lantern",
  "Meadow",
  "Mountain",
  "Nebula",
  "Otter",
  "Pebble",
  "Sparrow",
  "Tide",
  "Voyager",
  "Willow",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomName() {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}

export function NewWorkflowButton({
  variant,
  size,
}: {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session } = useSession();

  const create = useMutation({
    mutationFn: () => {
      if (!session?.user?.id) {
        throw new Error("You need to be signed in");
      }
      return createWorkflow({
        name: randomName(),
        userId: session.user.id,
      });
    },
    onSuccess: (wf) => {
      qc.invalidateQueries({ queryKey: ["workflows"] });
      toast.success(`Created "${wf.name}"`);
      if (wf?.id) router.push(`/workflows/${wf.id}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    },
  });

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => create.mutate()}
      disabled={create.isPending}
    >
      {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
      New workflow
    </Button>
  );
}
