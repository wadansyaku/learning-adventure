import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Gacha from "./pages/Gacha";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ProblemPlay from "./pages/ProblemPlay";
import CreateTask from "./pages/CreateTask";
import CreateProblem from "./pages/CreateProblem";
import Story from "./pages/Story";
import StoryDetail from "./pages/StoryDetail";
import CharacterChat from "./pages/CharacterChat";
import Achievements from "./pages/Achievements";
import CharacterSelect from "./pages/CharacterSelect";
import Tasks from "./pages/Tasks";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/student"} component={StudentDashboard} />
      <Route path={"/teacher"} component={TeacherDashboard} />
      <Route path={"/gacha"} component={Gacha} />
      <Route path={"/story"} component={Story} />
      <Route path={"/story/:id"} component={StoryDetail} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/chat"} component={CharacterChat} />
      <Route path={"/character-select"} component={CharacterSelect} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/parent"} component={ParentDashboard} />
      <Route path={"/play"} component={ProblemPlay} />
      <Route path={"/teacher/create-task"} component={CreateTask} />
      <Route path={"/teacher/create-problem"} component={CreateProblem} />
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
