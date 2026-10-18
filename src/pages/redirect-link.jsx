import {storeClicks} from "@/db/apiClicks";
import {getLongUrl} from "@/db/apiUrls";
import useFetch from "@/hooks/use-fetch";
import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {BarLoader} from "react-spinners";

const RedirectLink = () => {
  const {id} = useParams();

  const {loading, data, fn} = useFetch(getLongUrl, id);

  const {loading: loadingStats, fn: fnStats} = useFetch(storeClicks, {
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <BarLoader width={"100%"} color="#36d7b7" />
        <p className="text-xl font-medium">Redirecting to your destination...</p>
      </div>
    );
  }

  if (!loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-3xl font-bold text-red-400">Link Not Found</h2>
        <p className="text-gray-400">The link you are trying to visit does not exist or has been removed.</p>
      </div>
    );
  }

  return null;
};

export default RedirectLink;
