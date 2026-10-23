import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import Error from "./error";
import * as yup from "yup";
import useFetch from "@/hooks/use-fetch";
import {createUrl} from "@/db/apiUrls";
import {BeatLoader} from "react-spinners";
import {UrlState} from "@/context";
import {QRCode} from "react-qrcode-logo";
import {Plus, Link2, Sparkles, Type, Globe} from "lucide-react";

const RESERVED_SLUGS = new Set([
  "auth",
  "dashboard",
  "link",
  "api",
  "admin",
  "login",
  "signup",
  "settings",
  "profile",
  "about",
  "pricing",
  "public",
  "assets",
  "favicon",
  "robots",
  "sitemap",
]);

export function CreateLink() {
  const {user} = UrlState();
  const navigate = useNavigate();
  const ref = useRef();

  const [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [defaultSlug, setDefaultSlug] = useState(() =>
    Math.random().toString(36).substr(2, 6)
  );

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink ? longLink : "",
    customUrl: "",
  });

  const activeSlug = formValues.customUrl?.trim() || defaultSlug;
  const targetShortUrl = `${window.location.origin}/${activeSlug}`;

  const schema = yup.object().shape({
    title: yup.string().trim().required("Title is required"),
    longUrl: yup
      .string()
      .trim()
      .required("Destination URL is required")
      .matches(/^https?:\/\/.+/i, "URL must start with http:// or https://")
      .test("is-valid-url", "Must be a valid web address", (value) => {
        if (!value) return false;
        try {
          const parsed = new URL(value);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      }),
    customUrl: yup
      .string()
      .trim()
      .matches(
        /^[a-zA-Z0-9-_]*$/,
        "Custom alias can only contain letters, numbers, hyphens, and underscores"
      )
      .test(
        "not-reserved",
        "This alias is reserved by the system. Please choose another.",
        (value) => {
          if (!value) return true;
          return !RESERVED_SLUGS.has(value.toLowerCase().trim());
        }
      ),
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
    if (errors[e.target.id]) {
      setErrors((prev) => ({...prev, [e.target.id]: ""}));
    }
  };

  const {
    loading,
    error,
    data,
    fn: fnCreateUrl,
  } = useFetch(createUrl, {
    ...formValues,
    short_url: defaultSlug,
    user_id: user?.id,
  });

  useEffect(() => {
    if (error === null && data) {
      navigate(`/link/${data[0].id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const createNewLink = async (e) => {
    e?.preventDefault();
    setErrors({});
    try {
      await schema.validate(formValues, {abortEarly: false});

      const canvas = ref.current?.canvasRef?.current;
      if (!canvas) {
        throw new Error("QR Canvas could not be rendered");
      }
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));

      await fnCreateUrl(blob, {
        ...formValues,
        short_url: defaultSlug,
        user_id: user?.id,
      });
    } catch (e) {
      const newErrors = {};
      if (e?.inner) {
        e.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({general: e.message});
      }
    }
  };

  return (
    <Dialog
      defaultOpen={Boolean(longLink)}
      onOpenChange={(res) => {
        if (!res) {
          setSearchParams({});
          setDefaultSlug(Math.random().toString(36).substr(2, 6));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-10 px-4 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Create New Link</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-bold text-xl text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Short Link
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter your destination URL and generate a shortened link with an instant QR code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={createNewLink} className="space-y-4 pt-2">
          {/* Real-time QR Code Canvas Preview */}
          {formValues?.longUrl && (
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/50 border border-border">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <QRCode
                  ref={ref}
                  size={160}
                  value={targetShortUrl}
                  quietZone={5}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 font-mono truncate max-w-full text-center">
                Scans to: <span className="text-primary font-semibold">{targetShortUrl}</span>
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold text-foreground">
              Link Title
            </Label>
            <div className="relative">
              <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="title"
                placeholder="e.g. Summer Marketing Campaign"
                value={formValues.title}
                onChange={handleChange}
                className="pl-10 h-10 rounded-xl bg-background border-border text-sm"
              />
            </div>
            {errors.title && <p className="text-xs text-destructive font-medium mt-1">{errors.title}</p>}
          </div>

          {/* Long URL */}
          <div className="space-y-1.5">
            <Label htmlFor="longUrl" className="text-xs font-semibold text-foreground">
              Destination URL
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="longUrl"
                placeholder="https://example.com/very/long/url"
                value={formValues.longUrl}
                onChange={handleChange}
                className="pl-10 h-10 rounded-xl bg-background border-border text-sm"
              />
            </div>
            {errors.longUrl && <p className="text-xs text-destructive font-medium mt-1">{errors.longUrl}</p>}
          </div>

          {/* Custom Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="customUrl" className="text-xs font-semibold text-foreground">
              Custom Alias <span className="font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
              <span className="px-3 text-xs text-muted-foreground bg-secondary/80 border-r border-border py-2.5 flex items-center gap-1 font-mono shrink-0">
                <Globe className="h-3 w-3" />
                {window.location.host}/
              </span>
              <Input
                id="customUrl"
                placeholder="my-custom-slug"
                value={formValues.customUrl}
                onChange={handleChange}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm font-mono"
              />
            </div>
            {errors.customUrl && <p className="text-xs text-destructive font-medium mt-1">{errors.customUrl}</p>}
          </div>

          {error && <Error message={error.message || errors.general} />}

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
            >
              {loading ? <BeatLoader size={8} color="currentColor" /> : "Create Short Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLink;
