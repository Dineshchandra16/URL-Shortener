/* eslint-disable react/prop-types */
import {Copy, Download, LinkIcon, Trash, Check, ExternalLink, Calendar} from "lucide-react";
import {Link} from "react-router-dom";
import {Button} from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import {deleteUrl} from "@/db/apiUrls";
import {BeatLoader} from "react-spinners";
import {useState} from "react";

const LinkCard = ({url = {}, fetchUrls}) => {
  const [copied, setCopied] = useState(false);

  const downloadImage = () => {
    const imageUrl = url?.qr;
    const fileName = url?.title || "qr-code";

    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const {loading: loadingDelete, fn: fnDelete} = useFetch(deleteUrl, url.id);

  const shortLink = url?.custom_url ? url?.custom_url : url.short_url;
  const fullShortUrl = `${window.location.origin}/${shortLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all">
      {/* QR Code thumbnail */}
      <div className="bg-white p-2 rounded-xl border border-border/80 shrink-0 shadow-sm self-center sm:self-start">
        <img
          src={url?.qr}
          className="h-24 w-24 object-contain"
          alt="QR code"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0 space-y-1.5 w-full">
        <Link
          to={`/link/${url?.id}`}
          className="group inline-flex items-center gap-2 hover:underline"
        >
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
            {url?.title}
          </span>
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity shrink-0" />
        </Link>

        {/* Shortened URL */}
        <div className="flex items-center gap-2">
          <a
            href={fullShortUrl}
            target="_blank"
            rel="noreferrer"
            className="text-base sm:text-lg text-primary font-semibold hover:underline break-all"
          >
            {fullShortUrl}
          </a>
        </div>

        {/* Original Long URL */}
        <div
          className="flex items-center gap-1.5 text-xs text-muted-foreground truncate"
          title={url?.original_url}
        >
          <LinkIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl">
            {url?.original_url}
          </span>
        </div>

        {/* Creation Date */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 pt-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(url?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-col lg:flex-row items-center gap-1.5 self-end sm:self-center shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className={`h-9 px-3 rounded-lg border-border transition-colors ${
            copied ? "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          title="Copy short link"
          aria-label="Copy short link"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-semibold">Copied!</span>
            </>
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={downloadImage}
          className="h-9 w-9 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          title="Download QR code"
          aria-label="Download QR code"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (confirm("Are you sure you want to delete this link?")) {
              fnDelete().then(() => fetchUrls());
            }
          }}
          disabled={loadingDelete}
          className="h-9 w-9 rounded-lg border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
          title="Delete link"
          aria-label="Delete link"
        >
          {loadingDelete ? <BeatLoader size={4} color="currentColor" /> : <Trash className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default LinkCard;
