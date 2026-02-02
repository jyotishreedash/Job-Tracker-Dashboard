import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  Briefcase,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type ApplicationStatus = "applied" | "interview" | "offer" | "rejected";

type JobApplication = {
  id: string;
  companyName: string;
  jobTitle: string;
  applicationDate: string; // YYYY-MM-DD
  status: ApplicationStatus;
  notes: string;
  links: string[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "job-tracker.applications.v1";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeParseLinks(text: string) {
  const raw = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const dedup = Array.from(new Set(raw));
  return dedup;
}

function statusLabel(s: ApplicationStatus) {
  switch (s) {
    case "applied":
      return "Applied";
    case "interview":
      return "Interview";
    case "offer":
      return "Offer";
    case "rejected":
      return "Rejected";
  }
}

function statusBadgeVariant(s: ApplicationStatus):
  | "default"
  | "secondary"
  | "destructive"
  | "outline" {
  switch (s) {
    case "applied":
      return "secondary";
    case "interview":
      return "default";
    case "offer":
      return "outline";
    case "rejected":
      return "destructive";
  }
}

function statusDotClass(s: ApplicationStatus) {
  switch (s) {
    case "applied":
      return "bg-muted-foreground/60";
    case "interview":
      return "bg-primary";
    case "offer":
      return "bg-accent";
    case "rejected":
      return "bg-destructive";
  }
}

function normalizeDateValue(v: string) {
  if (!v) return "";
  const trimmed = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function tryLoadApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JobApplication[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

function saveApplications(apps: JobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function seedIfEmpty(existing: JobApplication[]) {
  if (existing.length) return existing;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const d = `${yyyy}-${mm}-${dd}`;

  const seeded: JobApplication[] = [
    {
      id: uid(),
      companyName: "Northwind Labs",
      jobTitle: "Frontend Engineer",
      applicationDate: d,
      status: "interview",
      notes: "Recruiter screen scheduled. Prep: project walkthrough + React architecture stories.",
      links: ["https://example.com/job-post", "https://example.com/company"],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    },
    {
      id: uid(),
      companyName: "Bluebird Studio",
      jobTitle: "Product Engineer",
      applicationDate: d,
      status: "applied",
      notes: "Applied via referral. Follow up next week if no response.",
      links: ["https://example.com/referral"],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
  ];

  return seeded;
}

function StatPill({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: number;
  tone: "muted" | "primary" | "accent" | "destructive";
  testId: string;
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/20 bg-primary/10 text-primary"
      : tone === "accent"
        ? "border-accent/20 bg-accent/10 text-accent"
        : tone === "destructive"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-border/70 bg-background/50 text-muted-foreground";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${toneClass}`}
      data-testid={testId}
    >
      <span className="font-medium" data-testid={`${testId}-label`}>
        {label}
      </span>
      <span className="rounded-full bg-foreground/5 px-2 py-0.5 font-semibold" data-testid={`${testId}-value`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      className="glass mx-auto flex max-w-2xl flex-col items-start gap-4 rounded-2xl p-6"
      data-testid="panel-empty"
    >
      <div className="flex items-center gap-3" data-testid="row-empty-header">
        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary" data-testid="icon-empty">
          <Briefcase className="size-5" />
        </div>
        <div className="space-y-0.5" data-testid="text-empty-title-wrap">
          <div className="font-serif text-xl" data-testid="text-empty-title">
            Track your job applications
          </div>
          <div className="text-sm text-muted-foreground" data-testid="text-empty-subtitle">
            Add your first application to start a focused, sortable dashboard.
          </div>
        </div>
      </div>
      <Button onClick={onAdd} data-testid="button-add-first">
        <Plus className="mr-2 size-4" /> Add application
      </Button>
    </div>
  );
}

function AppFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: JobApplication | null;
  onSave: (app: Omit<JobApplication, "createdAt" | "updatedAt">) => void;
}) {
  const isEdit = Boolean(initial);
  const [companyName, setCompanyName] = React.useState(initial?.companyName ?? "");
  const [jobTitle, setJobTitle] = React.useState(initial?.jobTitle ?? "");
  const [applicationDate, setApplicationDate] = React.useState(
    initial?.applicationDate ?? normalizeDateValue(new Date().toISOString()),
  );
  const [status, setStatus] = React.useState<ApplicationStatus>(initial?.status ?? "applied");
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [linksText, setLinksText] = React.useState((initial?.links ?? []).join("\n"));

  React.useEffect(() => {
    setCompanyName(initial?.companyName ?? "");
    setJobTitle(initial?.jobTitle ?? "");
    setApplicationDate(initial?.applicationDate ?? normalizeDateValue(new Date().toISOString()));
    setStatus(initial?.status ?? "applied");
    setNotes(initial?.notes ?? "");
    setLinksText((initial?.links ?? []).join("\n"));
  }, [initial, open]);

  const canSave = companyName.trim().length > 0 && jobTitle.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]" data-testid="dialog-application">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl" data-testid="text-dialog-title">
            {isEdit ? "Edit application" : "New application"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4" data-testid="form-application">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="grid-form-top">
            <div className="grid gap-2" data-testid="field-company">
              <Label htmlFor="company" data-testid="label-company">
                Company
              </Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Inc"
                data-testid="input-company"
              />
            </div>
            <div className="grid gap-2" data-testid="field-title">
              <Label htmlFor="title" data-testid="label-title">
                Job title
              </Label>
              <Input
                id="title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Product Engineer"
                data-testid="input-title"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-testid="grid-form-mid">
            <div className="grid gap-2" data-testid="field-date">
              <Label htmlFor="date" data-testid="label-date">
                Application date
              </Label>
              <div className="relative" data-testid="wrap-date">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(normalizeDateValue(e.target.value))}
                  className="pl-9"
                  data-testid="input-date"
                />
              </div>
            </div>

            <div className="grid gap-2" data-testid="field-status">
              <Label data-testid="label-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent data-testid="select-content-status">
                  <SelectItem value="applied" data-testid="option-status-applied">
                    Applied
                  </SelectItem>
                  <SelectItem value="interview" data-testid="option-status-interview">
                    Interview
                  </SelectItem>
                  <SelectItem value="offer" data-testid="option-status-offer">
                    Offer
                  </SelectItem>
                  <SelectItem value="rejected" data-testid="option-status-rejected">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2" data-testid="field-actions">
              <Label data-testid="label-quick">Quick actions</Label>
              <div className="flex gap-2" data-testid="row-quick-actions">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    const d = normalizeDateValue(new Date().toISOString());
                    setApplicationDate(d);
                  }}
                  data-testid="button-set-today"
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setLinksText((t) => (t ? `${t}\n` : "") + "https://")}
                  data-testid="button-add-link"
                >
                  Add link
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-2" data-testid="field-links">
            <Label htmlFor="links" data-testid="label-links">
              Links (one per line)
            </Label>
            <Textarea
              id="links"
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder="https://..."
              className="min-h-[86px]"
              data-testid="textarea-links"
            />
          </div>

          <div className="grid gap-2" data-testid="field-notes">
            <Label htmlFor="notes" data-testid="label-notes">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, next steps, who you talked to..."
              className="min-h-[120px]"
              data-testid="textarea-notes"
            />
          </div>

          <Separator />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end" data-testid="row-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              onClick={() => {
                if (!canSave) return;
                const now = Date.now();
                onSave({
                  id: initial?.id ?? uid(),
                  companyName: companyName.trim(),
                  jobTitle: jobTitle.trim(),
                  applicationDate: normalizeDateValue(applicationDate) || normalizeDateValue(new Date().toISOString()),
                  status,
                  notes: notes.trim(),
                  links: safeParseLinks(linksText),
                });
                onOpenChange(false);
              }}
              data-testid="button-save"
            >
              <Check className="mr-2 size-4" /> {isEdit ? "Save changes" : "Add application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LinkList({ links }: { links: string[] }) {
  const { toast } = useToast();

  if (!links.length) {
    return (
      <div className="text-xs text-muted-foreground" data-testid="text-no-links">
        No links
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="list-links">
      {links.map((href, idx) => {
        const key = `${href}-${idx}`;
        const display = href.replace(/^https?:\/\//, "");
        return (
          <div key={key} className="inline-flex items-center gap-1" data-testid={`row-link-${idx}`}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-1 text-xs text-foreground/90 transition hover:bg-background"
              data-testid={`link-out-${idx}`}
            >
              <ExternalLink className="size-3 text-muted-foreground" />
              <span className="max-w-[240px] truncate" data-testid={`text-link-${idx}`}>
                {display}
              </span>
            </a>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full border border-border/70 bg-background/60 text-muted-foreground transition hover:bg-background hover:text-foreground"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(href);
                  toast({ title: "Copied", description: "Link copied to clipboard." });
                } catch {
                  toast({ title: "Could not copy", description: "Your browser blocked clipboard access." });
                }
              }}
              data-testid={`button-copy-link-${idx}`}
              aria-label="Copy link"
            >
              <Copy className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-delete">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl" data-testid="text-delete-title">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground" data-testid="text-delete-description">
          {description}
        </div>
        <div className="mt-4 flex justify-end gap-2" data-testid="row-delete-actions">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            data-testid="button-delete-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            data-testid="button-delete-confirm"
          >
            <Trash2 className="mr-2 size-4" /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationsTable({
  apps,
  onEdit,
  onDelete,
}: {
  apps: JobApplication[];
  onEdit: (app: JobApplication) => void;
  onDelete: (app: JobApplication) => void;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl" data-testid="table-applications">
      <div className="grid grid-cols-12 gap-3 border-b border-border/60 bg-background/40 px-4 py-3 text-xs font-semibold text-muted-foreground" data-testid="row-table-head">
        <div className="col-span-4" data-testid="col-head-role">
          Role
        </div>
        <div className="col-span-3" data-testid="col-head-company">
          Company
        </div>
        <div className="col-span-2" data-testid="col-head-date">
          Date
        </div>
        <div className="col-span-2" data-testid="col-head-status">
          Status
        </div>
        <div className="col-span-1 text-right" data-testid="col-head-actions">
          Actions
        </div>
      </div>

      <div className="divide-y divide-border/40" data-testid="body-table">
        {apps.map((app) => {
          return (
            <div
              key={app.id}
              className="grid grid-cols-12 gap-3 px-4 py-3 transition hover:bg-background/50"
              data-testid={`row-application-${app.id}`}
            >
              <div className="col-span-4" data-testid={`cell-role-${app.id}`}>
                <div className="flex items-start gap-2" data-testid={`row-role-${app.id}`}>
                  <div
                    className={`mt-1 size-2 rounded-full ${statusDotClass(app.status)}`}
                    data-testid={`dot-status-${app.id}`}
                  />
                  <div className="min-w-0" data-testid={`wrap-role-text-${app.id}`}>
                    <div className="truncate font-medium" data-testid={`text-title-${app.id}`}>
                      {app.jobTitle}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground" data-testid={`text-notes-preview-${app.id}`}>
                      {app.notes || "\u2014"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-3" data-testid={`cell-company-${app.id}`}>
                <div className="truncate font-medium" data-testid={`text-company-${app.id}`}>
                  {app.companyName}
                </div>
                <div className="mt-0.5" data-testid={`wrap-links-${app.id}`}>
                  <LinkList links={app.links} />
                </div>
              </div>

              <div className="col-span-2" data-testid={`cell-date-${app.id}`}>
                <div className="inline-flex items-center gap-2 text-sm" data-testid={`row-date-${app.id}`}>
                  <Calendar className="size-4 text-muted-foreground" />
                  <span data-testid={`text-date-${app.id}`}>
                    {app.applicationDate ? format(new Date(app.applicationDate + "T00:00:00"), "MMM d, yyyy") : "\u2014"}
                  </span>
                </div>
              </div>

              <div className="col-span-2" data-testid={`cell-status-${app.id}`}>
                <Badge variant={statusBadgeVariant(app.status)} data-testid={`badge-status-${app.id}`}>
                  {statusLabel(app.status)}
                </Badge>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-2" data-testid={`cell-actions-${app.id}`}>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onEdit(app)}
                  data-testid={`button-edit-${app.id}`}
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onDelete(app)}
                  data-testid={`button-delete-${app.id}`}
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();

  const [apps, setApps] = React.useState<JobApplication[]>(() => {
    const loaded = tryLoadApplications();
    const seeded = seedIfEmpty(loaded);
    saveApplications(seeded);
    return seeded;
  });

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ApplicationStatus | "all">("all");
  const [sort, setSort] = React.useState<"date_desc" | "date_asc" | "updated_desc">("date_desc");

  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<JobApplication | null>(null);

  const [openDelete, setOpenDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState<JobApplication | null>(null);

  React.useEffect(() => {
    saveApplications(apps);
  }, [apps]);

  const counts = React.useMemo(() => {
    const base = { applied: 0, interview: 0, offer: 0, rejected: 0 } as Record<ApplicationStatus, number>;
    for (const a of apps) base[a.status] += 1;
    return base;
  }, [apps]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = apps;

    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (q) {
      list = list.filter((a) => {
        return (
          a.companyName.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q) ||
          a.links.some((l) => l.toLowerCase().includes(q))
        );
      });
    }

    const sorted = [...list].sort((a, b) => {
      if (sort === "updated_desc") return b.updatedAt - a.updatedAt;
      const aTime = new Date(a.applicationDate + "T00:00:00").getTime();
      const bTime = new Date(b.applicationDate + "T00:00:00").getTime();
      if (sort === "date_asc") return aTime - bTime;
      return bTime - aTime;
    });

    return sorted;
  }, [apps, query, statusFilter, sort]);

  const header = (
    <div className="flex flex-col gap-6" data-testid="section-header">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-testid="row-header-top">
        <div className="space-y-2" data-testid="wrap-title">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground" data-testid="text-kicker">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              Tracker
            </span>
            <span className="hidden text-muted-foreground/70 md:inline">\u2022</span>
            <span className="hidden md:inline" data-testid="text-subkicker">
              Built for quick reviews & next steps
            </span>
          </div>

          <h1
            className="font-serif text-4xl leading-[1.05] tracking-tight text-balance md:text-5xl"
            data-testid="text-app-title"
          >
            Job Application Tracker
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground" data-testid="text-app-subtitle">
            A calm, sortable dashboard to keep every application\u2014and every next step\u2014in one place.
          </p>
        </div>

        <div className="flex items-center gap-2" data-testid="row-header-actions">
          <Button
            variant="secondary"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setApps([]);
              toast({ title: "Reset", description: "Local data cleared." });
            }}
            data-testid="button-reset"
          >
            Reset
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            data-testid="button-add"
          >
            <Plus className="mr-2 size-4" /> Add
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" data-testid="row-stats">
        <StatPill label="Applied" value={counts.applied} tone="muted" testId="stat-applied" />
        <StatPill label="Interview" value={counts.interview} tone="primary" testId="stat-interview" />
        <StatPill label="Offer" value={counts.offer} tone="accent" testId="stat-offer" />
        <StatPill label="Rejected" value={counts.rejected} tone="destructive" testId="stat-rejected" />
      </div>

      <div className="glass flex flex-col gap-3 rounded-2xl p-4" data-testid="panel-controls">
        <div className="flex flex-col gap-3 md:flex-row md:items-center" data-testid="row-controls">
          <div className="relative flex-1" data-testid="wrap-search">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, title, notes, link..."
              className="pl-9"
              data-testid="input-search"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:items-center" data-testid="wrap-filters">
            <div className="flex items-center gap-2" data-testid="control-status">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground" data-testid="label-filter-status">
                <Filter className="size-4" /> Status
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}
              >
                <SelectTrigger className="min-w-[168px]" data-testid="select-filter-status">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent data-testid="select-content-filter-status">
                  <SelectItem value="all" data-testid="option-filter-all">
                    All
                  </SelectItem>
                  <SelectItem value="applied" data-testid="option-filter-applied">
                    Applied
                  </SelectItem>
                  <SelectItem value="interview" data-testid="option-filter-interview">
                    Interview
                  </SelectItem>
                  <SelectItem value="offer" data-testid="option-filter-offer">
                    Offer
                  </SelectItem>
                  <SelectItem value="rejected" data-testid="option-filter-rejected">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2" data-testid="control-sort">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground" data-testid="label-sort">
                <ArrowDownUp className="size-4" /> Sort
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                <SelectTrigger className="min-w-[200px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent data-testid="select-content-sort">
                  <SelectItem value="date_desc" data-testid="option-sort-date-desc">
                    Newest date
                  </SelectItem>
                  <SelectItem value="date_asc" data-testid="option-sort-date-asc">
                    Oldest date
                  </SelectItem>
                  <SelectItem value="updated_desc" data-testid="option-sort-updated-desc">
                    Recently updated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground" data-testid="text-results">
          Showing <span className="font-medium text-foreground" data-testid="text-results-count">{filtered.length}</span> of{" "}
          <span className="font-medium text-foreground" data-testid="text-total-count">{apps.length}</span> applications
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen app-surface" data-testid="page-dashboard">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6" data-testid="container-dashboard">
        {header}

        <div className="mt-8" data-testid="section-table">
          {apps.length === 0 ? (
            <EmptyState
              onAdd={() => {
                setEditing(null);
                setOpenForm(true);
              }}
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between" data-testid="row-table-header">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-table-title">
                  <Briefcase className="size-4" /> Applications
                </div>

                <div className="hidden items-center gap-2 md:flex" data-testid="row-table-hints">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground" data-testid="hint-persist">
                    <span className="inline-flex size-2 rounded-full bg-primary/70" /> Saves to this browser
                  </div>
                </div>
              </div>

              <ApplicationsTable
                apps={filtered}
                onEdit={(app) => {
                  setEditing(app);
                  setOpenForm(true);
                }}
                onDelete={(app) => {
                  setDeleting(app);
                  setOpenDelete(true);
                }}
              />
            </>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3" data-testid="section-footer">
          <Card className="glass rounded-2xl p-5" data-testid="card-tips">
            <div className="flex items-start gap-3" data-testid="row-tips">
              <div className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent" data-testid="icon-tips">
                <Briefcase className="size-5" />
              </div>
              <div className="space-y-1" data-testid="wrap-tips">
                <div className="font-serif text-lg" data-testid="text-tips-title">
                  Small habit, big clarity
                </div>
                <div className="text-sm text-muted-foreground" data-testid="text-tips-body">
                  Log your application the same day, then update status after every touchpoint.
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass rounded-2xl p-5" data-testid="card-status">
            <div className="flex items-start gap-3" data-testid="row-status">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary" data-testid="icon-status">
                <Check className="size-5" />
              </div>
              <div className="space-y-1" data-testid="wrap-status">
                <div className="font-serif text-lg" data-testid="text-status-title">
                  Status-first sorting
                </div>
                <div className="text-sm text-muted-foreground" data-testid="text-status-body">
                  Filter to one status (Interview, Offer) and work that queue intentionally.
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass rounded-2xl p-5" data-testid="card-privacy">
            <div className="flex items-start gap-3" data-testid="row-privacy">
              <div className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive" data-testid="icon-privacy">
                <Briefcase className="size-5" />
              </div>
              <div className="space-y-1" data-testid="wrap-privacy">
                <div className="font-serif text-lg" data-testid="text-privacy-title">
                  Your notes stay local
                </div>
                <div className="text-sm text-muted-foreground" data-testid="text-privacy-body">
                  This prototype saves applications in your browser so it persists on refresh.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AppFormDialog
        open={openForm}
        onOpenChange={(v) => {
          setOpenForm(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        onSave={(payload) => {
          const now = Date.now();
          setApps((prev) => {
            const exists = prev.some((p) => p.id === payload.id);
            if (!exists) {
              const next = [{ ...payload, createdAt: now, updatedAt: now }, ...prev];
              toast({ title: "Saved", description: "Application added." });
              return next;
            }
            const next = prev.map((p) =>
              p.id === payload.id
                ? {
                    ...p,
                    ...payload,
                    updatedAt: now,
                  }
                : p,
            );
            toast({ title: "Saved", description: "Changes saved." });
            return next;
          });
        }}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onOpenChange={(v) => {
          setOpenDelete(v);
          if (!v) setDeleting(null);
        }}
        title="Delete this application?"
        description="This removes it from your dashboard. (It will also disappear after refresh because it's saved locally.)"
        onConfirm={() => {
          if (!deleting) return;
          setApps((prev) => prev.filter((p) => p.id !== deleting.id));
          toast({ title: "Deleted", description: "Application removed." });
        }}
      />
    </div>
  );
}
