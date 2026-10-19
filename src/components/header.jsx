import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {logout} from "@/db/apiAuth";
import useFetch from "@/hooks/use-fetch";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Home, LinkIcon, LogOut, ArrowRight} from "lucide-react";
import {Link, useNavigate} from "react-router-dom";
import {BarLoader} from "react-spinners";
import {Button} from "./ui/button";
import {UrlState} from "@/context";
import {ThemeToggle} from "./theme-toggle";

const Header = () => {
  const {loading, fn: fnLogout} = useFetch(logout);
  const navigate = useNavigate();

  const {user, fetchUser} = UrlState();

  const userInitials =
    user?.user_metadata?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors duration-200">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            className="h-9 w-9 rounded-xl object-contain shadow-sm transition-transform duration-200 group-hover:scale-105"
            alt="Trimrr Logo"
          />
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Trimrr
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!user ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Log In
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                className="text-sm font-semibold shadow-sm hover:shadow transition-all"
              >
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="w-10 h-10 rounded-full overflow-hidden focus:outline-none ring-2 ring-primary/20 hover:ring-primary/50 transition-all shrink-0">
                <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                  <AvatarImage
                    src={user?.user_metadata?.profile_pic}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="font-semibold text-xs text-foreground bg-secondary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 shadow-lg border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user?.user_metadata?.name || "Account"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center cursor-pointer w-full py-2">
                    <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center cursor-pointer w-full py-2">
                    <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>My Links</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    fnLogout().then(() => {
                      fetchUser();
                      navigate("/auth");
                    });
                  }}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {loading && <BarLoader width={"100%"} color="#2563EB" />}
    </header>
  );
};

export default Header;
