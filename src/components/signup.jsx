import {useEffect, useState} from "react";
import Error from "./error";
import {Input} from "./ui/input";
import {Label} from "./ui/label";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {Button} from "./ui/button";
import {useNavigate, useSearchParams} from "react-router-dom";
import {signup} from "@/db/apiAuth";
import {BeatLoader} from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import {User, Mail, Lock, Eye, EyeOff, UploadCloud, ArrowRight, CheckCircle2} from "lucide-react";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });

  const handleInputChange = (e) => {
    const {name, value, files} = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: ""}));
    }
  };

  const {loading, error, fn: fnSignup, data} = useFetch(signup, formData);

  useEffect(() => {
    if (error === null && data) {
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading]);

  const handleSignup = async (e) => {
    e?.preventDefault();
    setErrors({});
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Full name is required"),
        email: Yup.string()
          .email("Please enter a valid email address")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: Yup.mixed().required("Profile picture is required"),
      });

      await schema.validate(formData, {abortEarly: false});
      await fnSignup();
    } catch (err) {
      const newErrors = {};
      if (err?.inner) {
        err.inner.forEach((item) => {
          newErrors[item.path] = item.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({api: err.message});
      }
    }
  };

  return (
    <Card className="border border-border bg-card shadow-lg shadow-black/5 dark:shadow-none rounded-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Create an account
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          Sign up to shorten links, generate QR codes, and view click analytics.
        </CardDescription>
        {error && <Error message={error?.message} />}
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name" className="text-xs font-semibold text-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 h-10 rounded-xl bg-background border-border focus-visible:ring-primary text-sm"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive font-medium mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-10 rounded-xl bg-background border-border focus-visible:ring-primary text-sm"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive font-medium mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-10 rounded-xl bg-background border-border focus-visible:ring-primary text-sm"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive font-medium mt-1">{errors.password}</p>}
          </div>

          {/* Profile Picture Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="profile_pic" className="text-xs font-semibold text-foreground">
              Profile Picture
            </Label>
            <label
              htmlFor="profile_pic"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-border bg-background hover:bg-secondary/50 cursor-pointer transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {formData.profile_pic ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground truncate">
                  {formData.profile_pic ? formData.profile_pic.name : "Choose an image file..."}
                </span>
                <span className="text-[11px] text-muted-foreground">PNG, JPG, or WEBP up to 5MB</span>
              </div>
              <input
                id="profile_pic"
                name="profile_pic"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="sr-only"
              />
            </label>
            {errors.profile_pic && <p className="text-xs text-destructive font-medium mt-1">{errors.profile_pic}</p>}
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
          >
            {loading ? (
              <BeatLoader size={8} color="currentColor" />
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Signup;
