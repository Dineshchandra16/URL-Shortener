import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader, BeatLoader } from "react-spinners";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  ExternalLink,
  Trash2,
  Calendar,
  MousePointerClick,
  Globe,
  Smartphone,
  BarChart3,
  QrCode,
} from "lucide-react";

import DeviceStats from "@/components/device-stats";
import Location from "@/components/location-stats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UrlState } from "@/context";
import { getClicksForUrl } from "@/db/apiClicks";
import { deleteUrl, getUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";

const LinkPage = () => {
  const navigate = useNavigate();
  const { user } = UrlState();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const {
    loading,
    data: url,
    fn,
    error,
  } = useFetch(getUrl, { id, user_id: user?.id });

  const {
    loading: loadingStats,
    data: stats,
    fn: fnStats,
  } = useFetch(getClicksForUrl, id);

  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, id);

  useEffect(() => {
    fn();
  }, [fn, id, user?.id]);

  useEffect(() => {
    if (!error && loading === false) fnStats();
  }, [loading, error, fnStats]);

  if (error) {
    navigate("/dashboard");
  }

  let link = "";
  if (url) {
    link = url?.custom_url ? url?.custom_url : url.short_url;
  }

  const fullShortUrl = `${window.location.origin}/${link}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = () => {
    if (!url?.qr) return;
    const imageUrl = url.qr;
    const fileName = `${url?.title || "trimrr-qr"}.png`;

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this short link? All click analytics will be permanently removed.")) {
      await fnDelete();
      navigate("/dashboard");
    }
  };

  const uniqueCitiesCount = stats
    ? new Set(stats.map((s) => s.city).filter(Boolean)).size
    : 0;

  return (
    <div className="space-y-6">
      {/* Loading bar */}
      {(loading || loadingStats) && (
        <BarLoader className="mb-2" width="100%" color="#2563EB" />
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Link Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground break-words leading-tight">
                  {url?.title || "Untitled Link"}
                </CardTitle>
              </div>

              {url?.created_at && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created {new Date(url.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Short URL Box */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Shortened Link
                </span>
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={fullShortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-lg sm:text-xl text-primary hover:underline break-all"
                  >
                    {fullShortUrl}
                  </a>
                  <Button
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={handleCopy}
                    className="h-8 shrink-0 gap-1.5 text-xs font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Destination URL */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Target Destination
                </span>
                <a
                  href={url?.original_url}
                  target="_blank"
                  rel="noreferrer"
                  title={url?.original_url}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1 font-mono text-xs">
                    {url?.original_url}
                  </span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="gap-2 flex-1 sm:flex-initial"
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loadingDelete}
                  className="gap-2 flex-1 sm:flex-initial ml-auto"
                >
                  {loadingDelete ? (
                    <BeatLoader size={4} color="white" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Link
                    </>
                  )}
                </Button>
              </div>

              {/* QR Code Container */}
              {url?.qr && (
                <div className="pt-2">
                  <div className="rounded-xl border border-border bg-white dark:bg-card p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
                      <img
                        src={url.qr}
                        alt="QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <QrCode className="h-3.5 w-3.5 text-primary" />
                      <span>Point camera to scan & test link</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analytics & Metrics */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Link Analytics
                  </CardTitle>
                  <CardDescription>
                    Real-time traffic and engagement statistics for this link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quick Stat Pill Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MousePointerClick className="h-3.5 w-3.5 text-primary" />
                    <span>Total Clicks</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {stats?.length || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 text-teal-500" />
                    <span>Locations</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                    {uniqueCitiesCount}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-1 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Top Device</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold capitalize text-foreground truncate">
                    {stats && stats.length > 0
                      ? stats[0]?.device || "Desktop"
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Chart Sections or Empty State */}
              {stats && stats.length > 0 ? (
                <div className="space-y-6 pt-2">
                  <div className="rounded-xl border border-border/80 p-4 bg-card">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      Traffic by Location
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Top cities visiting your shortened link
                    </p>
                    <Location stats={stats} />
                  </div>

                  <div className="rounded-xl border border-border/80 p-4 bg-card">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      Device Breakdown
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Platforms and device categories used by visitors
                    </p>
                    <DeviceStats stats={stats} />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-10 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground">
                      No clicks recorded yet
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Share your short URL or QR code across social media, emails, or messages to start tracking real-time analytics.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Short Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LinkPage;
