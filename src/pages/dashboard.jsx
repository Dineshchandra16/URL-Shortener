import {useEffect, useState} from "react";
import {BarLoader} from "react-spinners";
import {Search, X, Link2, MousePointerClick, Plus, Sparkles} from "lucide-react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {CreateLink} from "@/components/create-link";
import LinkCard from "@/components/link-card";
import Error from "@/components/error";

import useFetch from "@/hooks/use-fetch";
import {getUrls} from "@/db/apiUrls";
import {getClicksForUrls} from "@/db/apiClicks";
import {UrlState} from "@/context";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {user} = UrlState();
  const {loading, error, data: urls, fn: fnUrls} = useFetch(getUrls, user.id);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    urls?.map((url) => url.id)
  );

  useEffect(() => {
    fnUrls();
  }, []);

  const filteredUrls = urls?.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {(loading || loadingClicks) && (
        <BarLoader width={"100%"} color="#2563EB" className="rounded-full" />
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Links Created
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Link2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {urls ? urls.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active shortened URLs in your account
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Clicks
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {clicks ? clicks.length : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative clicks tracked across all links
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            My Links
            {urls && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                {urls.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage, share, and monitor performance of your shortened URLs.
          </p>
        </div>
        <CreateLink />
      </div>

      {/* Filter / Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by link title or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-xl bg-card border-border shadow-sm text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && <Error message={error?.message} />}

      {/* Links List / Empty States */}
      {urls && urls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/50 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Link2 className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No links created yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your very first short link to start tracking real-time click analytics.
            </p>
          </div>
          <CreateLink />
        </div>
      ) : filteredUrls && filteredUrls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-border bg-card/40 text-center space-y-3">
          <p className="text-base font-semibold text-foreground">No links found</p>
          <p className="text-xs text-muted-foreground">
            No links match &ldquo;{searchQuery}&rdquo;. Try another search keyword.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="rounded-lg text-xs"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(filteredUrls || []).map((url, i) => (
            <LinkCard key={url.id || i} url={url} fetchUrls={fnUrls} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
