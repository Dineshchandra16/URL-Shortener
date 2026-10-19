import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { storeClicks } from "@/db/apiClicks";
import { getLongUrl } from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Link2Off } from "lucide-react";

const RedirectLink = () => {
  const { id } = useParams();

  const { loading, data, fn } = useFetch(getLongUrl, id);

  const { loading: loadingStats, fn: fnStats } = useFetch(storeClicks, {
    id: data?.id,
    originalUrl: data?.original_url,
  });

  useEffect(() => {
    fn();
  }, []);

  useEffect(() => {
    if (!loading && data) {
      fnStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data]);

  if (loading || loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-full max-w-md space-y-4">
          <BarLoader width="100%" color="#2563EB" />
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-foreground flex items-center justify-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary animate-pulse" />
              Redirecting...
            </h2>
            <p className="text-sm text-muted-foreground">
              Taking you to your destination. Please wait a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Link2Off className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Link Not Found
          </h2>
          <p className="text-sm text-muted-foreground">
            The short link you are trying to visit does not exist, has expired, or was removed by its creator.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Go to Homepage
          </Link>
        </Button>
      </div>
    );
  }

  return null;
};

export default RedirectLink;
