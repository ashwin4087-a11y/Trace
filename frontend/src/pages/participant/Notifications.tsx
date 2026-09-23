import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { TracePageLayout } from "../../components/trace/TracePageLayout";
import { TraceButton } from "../../components/trace/TraceButton";
import { TraceBadge } from "../../components/trace/TraceBadge";
import { TraceEmptyState } from "../../components/trace/TraceEmptyState";
import { TraceLoadingState } from "../../components/trace/TraceLoadingState";
import { TraceErrorState } from "../../components/trace/TraceErrorState";
import { listNotifications, markAllRead, markRead } from "../../services/notification.service";
import type { AppNotification } from "../../types/notification";

export function NotificationsPage() {
  const { language } = useApp();
  const client = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = query.data ?? [];
  const unreadNotifications = notifications.filter((n) => !n.readAt);
  const unreadCount = unreadNotifications.length;

  // Categorize notifications based on type / title / link
  const categorized = notifications.filter((n) => {
    if (filter === "all") return true;
    const typeLower = (n.type || "").toLowerCase();
    const titleLower = (n.title || "").toLowerCase();
    
    if (filter === "workshops") return typeLower.includes("workshop") || titleLower.includes("workshop");
    if (filter === "certificates") return typeLower.includes("certificate") || titleLower.includes("certificate");
    if (filter === "community") return typeLower.includes("community") || titleLower.includes("discussion") || typeLower.includes("post");
    if (filter === "learning-paths") return typeLower.includes("path") || titleLower.includes("path");
    if (filter === "skill-passport") return typeLower.includes("skill") || titleLower.includes("skill");
    return true;
  });

  const filterOptions = [
    { key: "all", label: language === "TA" ? "அனைத்தும்" : "All", count: notifications.length },
    { key: "workshops", label: language === "TA" ? "பட்டறைகள்" : "Workshops" },
    { key: "certificates", label: language === "TA" ? "சான்றிதழ்கள்" : "Certificates" },
    { key: "community", label: language === "TA" ? "சமூகங்கள்" : "Community" },
    { key: "learning-paths", label: language === "TA" ? "கற்றல் பாதைகள்" : "Learning Paths" },
    { key: "skill-passport", label: language === "TA" ? "திறன் கடவுச்சீட்டு" : "Skill Passport" },
  ];

  return (
    <TracePageLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-8">
        {/* Editorial Header */}
        <header className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#5F524B] mb-1">
                <span>Archive Index</span>
                <span>/</span>
                <span className="text-[#BF9270] font-semibold">Chronicle Log</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1412] font-normal tracking-tight">
                {language === "TA" ? "அறிவிப்புகள்" : "Notifications"}
              </h1>
              <p className="font-serif italic text-base text-[#5F524B] mt-1">
                “Your learning journey, in one place.”
              </p>
              <p className="font-sans text-xs text-[#5F524B] mt-0.5">
                உங்கள் கற்றல் பயணம், ஒரே இடத்தில்.
              </p>
            </div>

            {/* Stream Operations */}
            <div className="flex items-center gap-4">
              <TraceButton
                variant="ghost"
                size="sm"
                icon="done_all"
                disabled={markAllMutation.isPending || unreadCount === 0}
                onClick={() => markAllMutation.mutate()}
              >
                {markAllMutation.isPending
                  ? language === "TA" ? "மாற்றப்படுகிறது..." : "Marking..."
                  : language === "TA" ? "அனைத்தையும் படித்ததாகக் குறி" : "Mark all as read"}
              </TraceButton>

              <div className="h-4 w-px bg-[#DFC1B0]"></div>

              <div className="flex items-center gap-1.5 font-sans text-xs text-[#5F524B]">
                <span className="w-2 h-2 rounded-full bg-[#BF9270]" />
                <span>
                  {unreadCount}{" "}
                  {language === "TA" ? "படிக்காத அறிவிப்புகள்" : unreadCount === 1 ? "Unread notification" : "Unread notifications"}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#DFC1B0]">
            {filterOptions.map((opt) => {
              const active = filter === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key)}
                  className={`px-4 py-1.5 rounded-full font-sans text-xs transition-all shrink-0 ${
                    active
                      ? "bg-[#BF9270] text-[#FFEDDB] font-semibold shadow-xs"
                      : "bg-[#FFFFFF] text-[#1A1412] hover:bg-[#EDCDBB]/60 border border-[#DFC1B0]/60"
                  }`}
                >
                  {opt.label} {opt.count !== undefined ? `(${opt.count})` : ""}
                </button>
              );
            })}
          </div>
        </header>

        {/* Content Layout: Feed + Preferences Note */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {query.isLoading && <TraceLoadingState count={3} />}
            {query.isError && (
              <TraceErrorState
                message="Unable to load notifications."
                onRetry={() => query.refetch()}
              />
            )}

            {!query.isLoading && !query.isError && categorized.length === 0 && (
              <TraceEmptyState
                icon="notifications_off"
                title={language === "TA" ? "நீங்கள் அனைத்தும் படித்துவிட்டீர்கள்." : "You're all caught up."}
                description={
                  language === "TA"
                    ? "புதிய கற்றல் நிகழ்வுகள், பட்டறைகள் மற்றும் சான்றிதழ் தகவல்கள் இங்கு காணப்படும்."
                    : "No notifications match your current filter. New workshop updates, certificate issues, and community exchanges will appear here."
                }
              />
            )}

            {!query.isLoading &&
              !query.isError &&
              categorized.map((item: AppNotification) => {
                const isUnread = !item.readAt;
                const formattedDate = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recently";

                return (
                  <article
                    key={item.id}
                    className={`bg-[#FFFFFF] border rounded-lg p-5 transition-all relative overflow-hidden ${
                      isUnread
                        ? "border-[#BF9270] shadow-xs"
                        : "border-[#DFC1B0] opacity-90"
                    }`}
                  >
                    {/* Unread Indicator Bar */}
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#BF9270]" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Category Icon */}
                      <div className="mt-0.5 w-9 h-9 rounded-full bg-[#FFEDDB] border border-[#DFC1B0] flex items-center justify-center text-[#BF9270] shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          {item.type?.toLowerCase().includes("certificate")
                            ? "workspace_premium"
                            : item.type?.toLowerCase().includes("community")
                            ? "forum"
                            : item.type?.toLowerCase().includes("skill")
                            ? "verified"
                            : "notifications"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <TraceBadge variant={isUnread ? "terracotta" : "cream"}>
                              {item.type || "Update"}
                            </TraceBadge>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#BF9270]" title="Unread" />
                            )}
                          </div>
                          <span className="font-sans text-xs text-[#5F524B] shrink-0">
                            {formattedDate}
                          </span>
                        </div>

                        <h2 className="font-serif text-lg text-[#1A1412] font-semibold mt-2">
                          {item.title}
                        </h2>

                        <p className="font-sans text-xs md:text-sm text-[#5F524B] mt-1 leading-relaxed">
                          {item.body}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[#DFC1B0]/40 flex flex-wrap items-center justify-between gap-2">
                          {/* Mark single as read button */}
                          {isUnread && (
                            <button
                              onClick={() => markSingleMutation.mutate(item.id)}
                              className="font-sans text-xs text-[#BF9270] hover:underline font-semibold flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">done</span>
                              {language === "TA" ? "படித்ததாகக் குறி" : "Mark as read"}
                            </button>
                          )}

                          {/* Navigation target link */}
                          {item.link ? (
                            <Link to={item.link} className="ml-auto">
                              <TraceButton variant="secondary" size="sm" icon="arrow_forward">
                                View
                              </TraceButton>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>

          {/* Right Sidebar: Notification Preferences & Summary */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#FFFFFF] border border-[#DFC1B0] rounded-xl p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[#DFC1B0]/60 pb-3">
                <span className="material-symbols-outlined text-[#BF9270]">tune</span>
                <h3 className="font-serif text-base font-semibold text-[#1A1412]">
                  {language === "TA" ? "அறிவிப்பு விருப்பங்கள்" : "Notification Preferences"}
                </h3>
              </div>

              <p className="font-sans text-xs text-[#5F524B] leading-relaxed">
                {language === "TA"
                  ? "கற்றல் பாதைப் புதுப்பிப்புகள், பட்டறைப் பரிந்துரைகள் மற்றும் சான்றிதழ் அறிவிப்புகள் உங்கள் மொழியில் கிடைக்கின்றன."
                  : "Notifications follow your scholar language and account settings. Important curricular milestones and workshop reminders are automatically dispatched."}
              </p>

              <div className="space-y-3 pt-2 font-sans text-xs text-[#1A1412]">
                <div className="flex items-center justify-between p-2 rounded bg-[#FFEDDB]/40">
                  <span>Workshop Recommendations</span>
                  <span className="text-[#BF9270] font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#FFEDDB]/40">
                  <span>Certificate Issuance</span>
                  <span className="text-[#BF9270] font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#FFEDDB]/40">
                  <span>Community Exchanges</span>
                  <span className="text-[#BF9270] font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TracePageLayout>
  );
}
