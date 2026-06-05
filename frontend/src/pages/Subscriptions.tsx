import { useState, useRef, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Download,
  Pause,
  Play,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { getActiveSubscriptions, toMonthlyAmount } from "@/stores/subscription";
import { useSubscriptionActions } from "@/hooks/useApiSync";
import { subscriptionsApi } from "@/lib/api";
import { useAccountStore } from "@/stores/account";
import {
  CATEGORY_CONFIG,
  type Category,
  type Subscription,
} from "@/types/subscription";
import { getCategoryIllustration } from "@/lib/visuals";
import { Illustration } from "@/components/ui/Illustration";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import { MaskDivider } from "@/components/layout/MaskDivider";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { UndoToast } from "@/components/ui/UndoToast";
import { Dropdown } from "@/components/ui/Dropdown";
import { currencySymbol } from "@/lib/format";
import { safeCsvCell } from "@/lib/security";

const FILTERS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "entertainment", label: "Entertainment" },
  { key: "productivity", label: "Productivity" },
  { key: "fitness", label: "Fitness" },
  { key: "cloud", label: "Cloud" },
  { key: "music", label: "Music" },
  { key: "news", label: "News" },
  { key: "food", label: "Food" },
  { key: "other", label: "Other" },
];

const CYCLE_SHORT: Record<string, string> = {
  monthly: "mo",
  yearly: "yr",
  weekly: "wk",
  custom: "cycle",
};

type SortKey = "name" | "amount" | "renewal" | "category";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "renewal", label: "Renewal date" },
  { key: "amount", label: "Amount" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
];

// ── CSV Export (#5) ─────────────────────────────────────────────────
// F-3: every cell is run through `safeCsvCell` so user-controlled values
// (`name`, `notes`, `currency`, …) can't be interpreted as a spreadsheet
// formula when the file is opened in Excel / Google Sheets.
function exportCsv(subs: Subscription[]) {
  const header =
    "Name,Amount,Currency,Billing Cycle,Category,Status,Next Renewal,Free Trial,Notes";
  const rows = subs.map((s) =>
    [
      safeCsvCell(s.name),
      safeCsvCell(s.amount.toFixed(2)),
      safeCsvCell(s.currency),
      safeCsvCell(s.billingCycle),
      safeCsvCell(s.category),
      safeCsvCell(s.status),
      safeCsvCell(s.nextRenewalDate),
      s.isFreeTrial ? "Yes" : "No",
      safeCsvCell(s.notes || ""),
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "recall-subscriptions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Memoized Row (#18) ──────────────────────────────────────────────
interface RowProps {
  sub: Subscription;
  sym: string;
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
  onTogglePause: (sub: Subscription) => void;
}

const SubscriptionRow = memo(function SubscriptionRow({
  sub,
  sym,
  onEdit,
  onDelete,
  onTogglePause,
}: RowProps) {
  const config = CATEGORY_CONFIG[sub.category];
  const daysUntil = differenceInDays(new Date(sub.nextRenewalDate), new Date());
  const cancelLabel =
    daysUntil <= 1
      ? "Cancel by today"
      : `Cancel by ${format(new Date(sub.nextRenewalDate), "MMM d")}`;

  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-surface px-4 py-4 sm:flex-nowrap sm:gap-5 sm:px-6 sm:py-5">
      <div
        className={`h-2 w-2 shrink-0 rounded-full ${
          sub.status === "active"
            ? "bg-success"
            : sub.status === "paused"
              ? "bg-warning"
              : "bg-muted"
        }`}
        title={sub.status}
      />
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md sm:h-12 sm:w-12"
        style={{ background: config.gradient }}
      >
        <ProviderIcon icon={sub.providerIcon} name={sub.name} size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{sub.name}</div>
        <div className="mt-0.5 text-xs text-muted">
          {sub.billingCycle === "monthly" ? "Monthly" : sub.billingCycle}{" "}
          &middot; {config.label}
          {sub.isFreeTrial && " · Free trial"}
          {sub.status !== "active" && ` · ${sub.status}`}
        </div>
      </div>
      <div className="min-w-[72px] text-right">
        <div className="text-[15px] font-semibold">
          {sym}
          {sub.amount.toFixed(2)}
        </div>
        <div className="mt-0.5 text-[11px] text-muted">
          /{CYCLE_SHORT[sub.billingCycle]}
        </div>
      </div>
      <div className="hidden min-w-[120px] text-right sm:block">
        <div
          className={`text-[13px] font-medium ${
            sub.isFreeTrial && daysUntil <= 7 ? "text-rausch" : ""
          }`}
        >
          {format(new Date(sub.nextRenewalDate), "MMM d, yyyy")}
        </div>
        <div className="mt-0.5 text-[11px] text-rausch">{cancelLabel}</div>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {/* Inline actions — desktop only. Mobile uses the kebab below. */}
        <div className="hidden gap-1.5 sm:flex">
          {sub.status !== "cancelled" && (
            <button
              onClick={() => onTogglePause(sub)}
              aria-label={
                sub.status === "paused"
                  ? `Resume ${sub.name}`
                  : `Pause ${sub.name}`
              }
              className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
            >
              {sub.status === "paused" ? <Play size={13} /> : <Pause size={13} />}
              <span>
                {sub.status === "paused" ? "Resume" : "Pause"}
              </span>
            </button>
          )}
          <button
            onClick={() => onEdit(sub)}
            aria-label={`Edit ${sub.name}`}
            className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(sub)}
            aria-label={`Delete ${sub.name}`}
            className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-rausch"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
        {/* Mobile kebab — placed on the right edge for one-thumb access. */}
        <div className="flex sm:hidden">
          <Dropdown
            align="right"
            trigger={
              <button
                type="button"
                aria-label={`More actions for ${sub.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-muted transition-colors hover:text-ink"
              >
                <MoreHorizontal size={16} />
              </button>
            }
            items={[
              ...(sub.status !== "cancelled"
                ? [
                    {
                      label: sub.status === "paused" ? "Resume" : "Pause",
                      icon:
                        sub.status === "paused" ? (
                          <Play size={14} />
                        ) : (
                          <Pause size={14} />
                        ),
                      onClick: () => onTogglePause(sub),
                    },
                  ]
                : []),
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () => onEdit(sub),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                onClick: () => onDelete(sub),
                danger: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
});

// ── Main Page ───────────────────────────────────────────────────────
export function SubscriptionsPage() {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("renewal");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const { subscriptions, updateSubscription, removeSubscription } =
    useSubscriptionActions();
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);

  // Undo state (#15)
  const [undoSub, setUndoSub] = useState<Subscription | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeCount = getActiveSubscriptions(subscriptions).length;

  // Trigger ref for focus return (#24)
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (sub: Subscription) => {
    setEditing(sub);
    setFormOpen(true);
  };

  // Pause/Resume toggle (#6)
  const handleTogglePause = useCallback(
    (sub: Subscription) => {
      const newStatus = sub.status === "paused" ? "active" : "paused";
      updateSubscription(sub.id, { status: newStatus });
    },
    [updateSubscription],
  );

  // Delete with confirmation modal (#7) and undo (#15)
  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    setUndoSub({ ...deleteTarget });
    removeSubscription(deleteTarget.id);
    setDeleteTarget(null);
    setShowUndo(true);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 6000);
  }, [deleteTarget, removeSubscription]);

  const handleUndo = useCallback(() => {
    if (!undoSub) return;
    // Restore locally with the original ID, then re-create on the backend so
    // the undo survives a refresh / stays in sync (local-first: API is best-effort).
    import("@/stores/subscription").then(({ useSubscriptionStore }) => {
      useSubscriptionStore.setState((state) => ({
        subscriptions: [...state.subscriptions, undoSub],
      }));
    });
    subscriptionsApi.create(undoSub).catch(() => {
      /* local-first */
    });
    setShowUndo(false);
    setUndoSub(null);
  }, [undoSub]);

  // CSV export (#5)
  const handleExport = () => exportCsv(subscriptions);

  // Filter + search + sort pipeline
  const filtered = useMemo(() => {
    let result = subscriptions;

    // Category filter
    if (filter !== "all") {
      result = result.filter((s) => s.category === filter);
    }

    // Search filter (#10)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    // Sort (#11)
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "amount":
          cmp = toMonthlyAmount(a) - toMonthlyAmount(b);
          break;
        case "renewal":
          cmp =
            new Date(a.nextRenewalDate).getTime() -
            new Date(b.nextRenewalDate).getTime();
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [subscriptions, filter, searchQuery, sortKey, sortDir]);

  const categoryArt = filter === "all" ? null : getCategoryIllustration(filter);

  const cycleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        <div className="flex flex-col gap-5 pb-8 pt-6 sm:flex-row sm:items-end sm:justify-between md:pb-10 md:pt-8">
          <div>
            <h1 className="font-display text-[34px] font-light tracking-[-2px] sm:text-[42px]">
              All <strong className="font-bold">subscriptions</strong>
            </h1>
            <p className="mt-3 max-w-[480px] text-[15px] text-muted md:text-base">
              Manage, track, and cancel your recurring charges in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              aria-label="Export as CSV"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-4 py-2.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              ref={addBtnRef}
              onClick={openAdd}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-rausch px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:self-auto"
            >
              <Plus size={17} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </div>

        {/* Active count */}
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
          <span>
            <strong className="font-semibold text-ink">{activeCount}</strong>{" "}
            active subscriptions
          </span>
        </div>

        {/* Search (#10) + Sort (#11) */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1 max-w-[360px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-ink/10 bg-surface py-2.5 pl-10 pr-4 text-[13px] focus:border-rausch focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-full border border-ink/10 bg-surface px-3 py-2 text-[12px] font-medium text-muted focus:border-rausch focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={cycleSortDir}
              aria-label={`Sort ${sortDir === "asc" ? "ascending" : "descending"}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-muted transition-colors hover:text-ink"
            >
              <ArrowUpDown
                size={15}
                className={sortDir === "desc" ? "rotate-180" : ""}
              />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-7 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? subscriptions.length
                : subscriptions.filter((s) => s.category === f.key).length;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all md:px-[18px] md:py-2 ${
                  filter === f.key
                    ? "border-transparent bg-ink/6 text-ink"
                    : "border-ink/8 text-muted hover:text-ink"
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Contextual category banner */}
        {categoryArt && filtered.length > 0 && (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-7 flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-surface px-6 py-5 md:px-8 md:py-6"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-rausch">
                {CATEGORY_CONFIG[filter as Category].label}
              </div>
              <div className="mt-2 text-[18px] font-light tracking-[-0.5px] md:text-[22px]">
                {filtered.length}{" "}
                {CATEGORY_CONFIG[filter as Category].label.toLowerCase()}{" "}
                subscription{filtered.length > 1 ? "s" : ""}
              </div>
            </div>
            <img
              src={categoryArt.src}
              alt=""
              aria-hidden
              draggable={false}
              className="h-[80px] w-[120px] shrink-0 object-contain md:h-[110px] md:w-[160px]"
            />
          </motion.div>
        )}

        {/* List (#18 memoized rows) */}
        <div className="pb-12">
          {filtered.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              sym={sym}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onTogglePause={handleTogglePause}
            />
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/8 py-16 text-center">
              {categoryArt ? (
                <img
                  src={categoryArt.src}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="mb-5 h-[120px] w-[160px] object-contain opacity-90"
                />
              ) : (
                <Illustration
                  name="empty"
                  className="mb-5 h-[140px] w-[150px] object-contain opacity-90"
                />
              )}
              <div className="text-[15px] font-medium text-ink">
                {searchQuery ? "No matches found" : "No subscriptions here yet"}
              </div>
              <p className="mt-1 max-w-[320px] text-[13px] text-muted">
                {searchQuery
                  ? `No subscriptions match "${searchQuery}". Try a different search.`
                  : "Nothing matches this filter. Add a subscription to start tracking it."}
              </p>
              {!searchQuery && (
                <button
                  onClick={openAdd}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-rausch/30 hover:text-rausch"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Add subscription
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <MaskDivider />

      <section className="pb-20 pt-8 text-center md:pb-24">
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add new subscription
        </button>
      </section>

      {formOpen && (
        <SubscriptionFormModal
          subscription={editing}
          onClose={() => setFormOpen(false)}
          triggerRef={addBtnRef}
        />
      )}

      {/* Delete confirmation modal (#7) */}
      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.name}?`}
          message="This subscription will be permanently removed. You can undo for a few seconds after deletion."
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Undo toast (#15) */}
      <UndoToast
        message={undoSub ? `${undoSub.name} deleted` : ""}
        visible={showUndo}
        onUndo={handleUndo}
        onDismiss={() => setShowUndo(false)}
      />
    </motion.div>
  );
}
