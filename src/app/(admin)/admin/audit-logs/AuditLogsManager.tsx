/**
 * AuditLogsManager Client Component ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Activity timeline console
 *
 * Implements:
 * 1. Filtering by admin email, action type, and targeted collection.
 * 2. Visual chronological timeline connected with dotted lines.
 * 3. Inspectable JSON delta viewer formatting old vs new state changes.
 *
 * @module app/(admin)/admin/audit-logs/AuditLogsManager
 */

"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal, Eye, EyeOff, Calendar } from "lucide-react";
import { Card, Button, Input, Select, Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui/Badge";

interface ActorPopulated {
  name: string;
  email: string;
}

interface AuditLogItem {
  _id: string;
  actor: ActorPopulated | null;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Record<string, unknown> | null;
  reason?: string | null;
  createdAt: string;
}

interface AuditLogsManagerProps {
  initialLogs: AuditLogItem[];
}

export function AuditLogsManager({ initialLogs }: AuditLogsManagerProps) {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchActor, setSearchActor] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  
  // Track expanded diff blocks
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Perform filtering
  const filteredLogs = logs.filter((log) => {
    const actorEmail = log.actor?.email?.toLowerCase() || "system";
    const matchesActor = actorEmail.includes(searchActor.toLowerCase());
    const matchesAction = filterAction ? log.action === filterAction : true;
    const matchesEntity = filterEntity ? log.entityType === filterEntity : true;
    return matchesActor && matchesAction && matchesEntity;
  });

  const getActionColor = (action: string): BadgeVariant => {
    switch (action?.toLowerCase()) {
      case "create":
        return "success";
      case "update":
      case "patch":
      case "publish":
        return "warning";
      case "delete":
      case "unpublish":
        return "difficulty-hard";
      case "impersonate":
      case "impersonate_end":
        return "accent";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] p-4 rounded-xl wobbly-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-fg)]">
          <SlidersHorizontal size={16} />
          <span>Filter Audit Records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Actor search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-fg-muted)]">
              <Search size={14} />
            </span>
            <Input
              value={searchActor}
              onChange={(e) => setSearchActor(e.target.value)}
              placeholder="Search actor email..."
              className="pl-9 text-sm"
            />
          </div>

          {/* Action select */}
          <Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            options={[
              { value: "", label: "-- All Actions --" },
              { value: "create", label: "Create" },
              { value: "update", label: "Update" },
              { value: "delete", label: "Delete" },
              { value: "publish", label: "Publish" },
              { value: "unpublish", label: "Unpublish" },
              { value: "impersonate", label: "Impersonate Start" },
              { value: "impersonate_end", label: "Impersonate End" },
            ]}
          />

          {/* Entity Type select */}
          <Select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            options={[
              { value: "", label: "-- All Collections --" },
              { value: "Category", label: "Category" },
              { value: "Question", label: "Question" },
              { value: "FeatureFlag", label: "Feature Flags" },
              { value: "User", label: "User" },
              { value: "Session", label: "Session" },
              { value: "Suggestion", label: "Suggestion" },
            ]}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-[var(--color-fg-muted)] font-bold pt-2 border-t border-[var(--color-border-light)] border-dashed">
          <p>Filters active: {searchActor || filterAction || filterEntity ? "Yes" : "No"}</p>
          <p>Showing {filteredLogs.length} of {logs.length} audit logs</p>
        </div>
      </div>

      {/* Audit Timeline */}
      <Card decoration="none" className="p-6 bg-[var(--color-bg-alt)] border-2 border-[var(--color-border)] wobbly-sm shadow-[var(--shadow-default)]">
        <div className="relative border-l-2 border-[var(--color-border-light)] pl-6 ml-3 space-y-8 py-2">
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-[var(--color-fg-muted)] italic font-[family-name:var(--font-body)]">
              No audit logs match selected filters.
            </p>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = !!expandedIds[log._id];
              const hasDiff = log.diff && Object.keys(log.diff).length > 0;

              return (
                <div key={log._id} className="relative">
                  {/* Dotted Node Bullet */}
                  <span className="absolute -left-[31px] top-1.5 flex items-center justify-center w-4.5 h-4.5 rounded-full border-2 bg-[var(--color-bg)] border-[var(--color-border)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-fg-muted)]" />
                  </span>

                  {/* Log Details Container */}
                  <div className="space-y-2">
                    {/* Timestamp + Action Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm font-bold text-[var(--color-fg)]">
                          {log.entityType}
                        </span>
                        <span className="font-mono text-xs text-[var(--color-fg-muted)]">
                          ({log.entityId})
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-fg-muted)] font-mono flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Actor Details */}
                    <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                      Admin: <strong className="text-[var(--color-fg)]">{log.actor ? `${log.actor.name} (${log.actor.email})` : "System / Dynamic trigger"}</strong>
                    </p>

                    {/* Impersonation/Reason note */}
                    {log.reason && (
                      <p className="text-xs bg-[var(--color-bg)] border border-[var(--color-border-light)] p-2 rounded font-mono text-[var(--color-fg-muted)] italic max-w-xl">
                        Note: &ldquo;{log.reason}&rdquo;
                      </p>
                    )}

                    {/* Diff/Delta inspection panel */}
                    {hasDiff && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={() => toggleExpand(log._id)}
                          className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 min-h-0 h-auto font-bold font-[family-name:var(--font-heading)] uppercase"
                        >
                          {isExpanded ? (
                            <>
                              <EyeOff size={10} /> Collapse Diff Details
                            </>
                          ) : (
                            <>
                              <Eye size={10} /> Inspect Changed Fields
                            </>
                          )}
                        </Button>

                        {isExpanded && (
                          <div className="mt-2 text-xs bg-black text-green-400 p-3 rounded font-mono overflow-x-auto max-w-full space-y-1 shadow-inner border border-zinc-800">
                            <p className="text-zinc-500 text-[10px] uppercase font-bold border-b border-zinc-800 pb-1 mb-1">
                              Modified Field Diffs
                            </p>
                            {Object.entries(log.diff!).map(([field, delta]) => {
                              const isComplexObj = typeof delta === "object" && delta !== null;
                              
                              let oldStr = "";
                              let newStr = "";

                              if (isComplexObj && ("old" in delta || "new" in delta)) {
                                const changed = delta as { old?: unknown; new?: unknown };
                                oldStr = typeof changed.old === "object" ? JSON.stringify(changed.old) : String(changed.old);
                                newStr = typeof changed.new === "object" ? JSON.stringify(changed.new) : String(changed.new);
                              } else {
                                newStr = JSON.stringify(delta);
                              }

                              return (
                                <div key={field} className="py-0.5">
                                  <span className="text-sky-400 font-bold">{field}</span>:
                                  {oldStr !== "" ? (
                                    <div className="pl-4 space-y-0.5">
                                      <p className="text-red-400 font-mono"><span className="text-red-500">-</span> {oldStr}</p>
                                      <p className="text-emerald-400 font-mono"><span className="text-emerald-500">+</span> {newStr}</p>
                                    </div>
                                  ) : (
                                    <span className="text-emerald-400 font-mono pl-2">{newStr}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
