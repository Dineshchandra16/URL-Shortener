import Login from "@/components/login";
import Signup from "@/components/signup";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {UrlState} from "@/context";
import {useEffect} from "react";
import {useNavigate, useSearchParams, Link} from "react-router-dom";
import {ArrowLeft, Sparkles} from "lucide-react";

function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {isAuthenticated, loading} = UrlState();
  const longLink = searchParams.get("createNew");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
  }, [isAuthenticated, loading, navigate, longLink]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-8 px-4">
      {/* Return link */}
      <div className="w-full max-w-md mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/logo.png" className="h-10 w-10 rounded-xl object-contain shadow-sm" alt="Trimrr" />
            <span className="text-2xl font-bold tracking-tight text-foreground">Trimrr</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {longLink ? "One step away from your short link" : "Welcome to Trimrr"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            {longLink
              ? "Sign in or create an account to finalize and track your shortened URL."
              : "Short links. Clear insights. Built for every click."}
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary rounded-xl mb-6 border border-border/50">
            <TabsTrigger
              value="login"
              className="rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Create Account
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-0 focus-visible:outline-none">
            <Login />
          </TabsContent>
          <TabsContent value="signup" className="mt-0 focus-visible:outline-none">
            <Signup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Auth;
