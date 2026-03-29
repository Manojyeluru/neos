import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { TeamLeaderLogin } from "./components/auth/TeamLeaderLogin";
import { ReviewerLogin } from "./components/auth/ReviewerLogin";
import { MagicLogin } from "./components/auth/MagicLogin";
import { AdminLogin } from "./components/auth/AdminLogin";
import RegisterTeam from "./components/auth/RegisterTeam";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RouteError } from "./components/RouteError";
import { FaceRegister } from "./components/auth/FaceRegister";

// Team Leader Portal
import { TeamLeaderDashboard } from "./components/team-leader/TeamLeaderDashboard";
import { ProblemSelection } from "./components/team-leader/ProblemSelection";
import { MyTeam } from "./components/team-leader/MyTeam";

// Reviewer Portal
import { ReviewerDashboard } from "./components/reviewer/ReviewerDashboard";

// Admin Portal
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ManageRounds } from "./components/admin/ManageRounds";
import { MarksCriteria } from "./components/admin/MarksCriteria";
import { ProblemStatements } from "./components/admin/ProblemStatements";
import { ManageReviewers } from "./components/admin/ManageReviewers";
import { TeamsOverview } from "./components/admin/TeamsOverview";
import { Results } from "./components/admin/Results";
import { AdminSettings } from "./components/admin/AdminSettings";
import { EventsManagement } from "./components/admin/EventsManagement";
import { AdminAttendance } from "./components/admin/AdminAttendance";
import { AdminVoting } from "./components/admin/AdminVoting";
import { ProjectUpload } from "./components/team-leader/ProjectUpload";
import { PublicVoting } from "./components/voting/PublicVoting";

import { Shell } from "./components/shared/Shell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        Component: Root,
      },
      {
        path: "login/team-leader",
        Component: TeamLeaderLogin,
      },
      {
        path: "login/reviewer",
        Component: ReviewerLogin,
      },
      {
        path: "reviewer/magic-login",
        Component: MagicLogin,
      },
      {
        path: "login/admin",
        Component: AdminLogin,
      },
      {
        path: "register",
        Component: RegisterTeam,
      },
      {
        path: "forgot-password",
        Component: ForgotPassword,
      },
      {
        path: "reset-password/:token",
        Component: ResetPassword,
      },
      {
        path: "face-register",
        Component: FaceRegister,
      },
      // Team Leader Portal
      {
        path: "teamleader/dashboard",
        element: <ProtectedRoute allowedRoles={["teamleader"]}><TeamLeaderDashboard /></ProtectedRoute>,
      },
      {
        path: "teamleader/problems",
        element: <ProtectedRoute allowedRoles={["teamleader"]}><ProblemSelection /></ProtectedRoute>,
      },
      {
        path: "teamleader/my-team",
        element: <ProtectedRoute allowedRoles={["teamleader"]}><MyTeam /></ProtectedRoute>,
      },
      // Reviewer Portal
      {
        path: "reviewer/dashboard",
        element: <ProtectedRoute allowedRoles={["reviewer"]}><ReviewerDashboard /></ProtectedRoute>,
      },
      // Admin Portal
      {
        path: "admin/dashboard",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><AdminDashboard /></ProtectedRoute>,
      },
      {
        path: "admin/rounds",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><ManageRounds /></ProtectedRoute>,
      },
      {
        path: "admin/criteria",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><MarksCriteria /></ProtectedRoute>,
      },
      {
        path: "admin/problems",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><ProblemStatements /></ProtectedRoute>,
      },
      {
        path: "admin/reviewers",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><ManageReviewers /></ProtectedRoute>,
      },
      {
        path: "admin/teams",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><TeamsOverview /></ProtectedRoute>,
      },
      {
        path: "admin/results",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><Results /></ProtectedRoute>,
      },
      {
        path: "admin/settings",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><AdminSettings /></ProtectedRoute>,
      },
      {
        path: "admin/events",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><EventsManagement /></ProtectedRoute>,
      },
      {
        path: "admin/attendance",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><AdminAttendance /></ProtectedRoute>,
      },
      {
        path: "admin/voting",
        element: <ProtectedRoute allowedRoles={["admin", "coordinator"]}><AdminVoting /></ProtectedRoute>,
      },
      {
        path: "teamleader/project-upload",
        element: <ProtectedRoute allowedRoles={["teamleader"]}><ProjectUpload /></ProtectedRoute>,
      },
      {
        path: "voting",
        Component: PublicVoting,
      }
    ]
  }
]);
