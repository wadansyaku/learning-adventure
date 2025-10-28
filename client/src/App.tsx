import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ProblemPlay from "./pages/ProblemPlay";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/student"} component={StudentDashboard} />
      <Route path={"/teacher"} component={TeacherDashboard} />
      <Route path={"/parent"} component={ParentDashboard} />
      <Route path={"/play"} component={ProblemPlay} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
