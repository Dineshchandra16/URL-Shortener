import Header from "@/components/header";
import Footer from "@/components/footer";
import {Outlet} from "react-router-dom";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container">
        <Header />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
