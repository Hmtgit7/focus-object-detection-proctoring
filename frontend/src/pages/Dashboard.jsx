import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useInterview } from "../contexts/InterviewContext";
import { interviewAPI, reportAPI, handleAPIError } from "../services/api";
import Loading from "../components/Common/Loading";
import InterviewStats from "../components/Dashboard/InterviewStats";
import RecentInterviews from "../components/Dashboard/RecentInterviews";
import UpcomingInterviews from "../components/Dashboard/UpcomingInterviews";

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const { interviews, fetchInterviews, loading } = useInterview();
  const [dashboardStats, setDashboardStats] = useState({
    totalInterviews: 0,
    scheduledInterviews: 0,
    completedInterviews: 0,
    averageIntegrityScore: 0,
    recentActivity: [],
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoadingStats(true);

      // Fetch interviews
      await fetchInterviews({ limit: 5 });

      // Load additional dashboard statistics
      await loadDashboardStats();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      // This would ideally be a dedicated dashboard stats API endpoint
      const interviewsResponse = await interviewAPI.getAll({ limit: 100 });
      const interviews = interviewsResponse.data.interviews;

      const stats = {
        totalInterviews: interviews.length,
        scheduledInterviews: interviews.filter((i) => i.status === "scheduled")
          .length,
        completedInterviews: interviews.filter((i) => i.status === "completed")
          .length,
        inProgressInterviews: interviews.filter(
          (i) => i.status === "in-progress"
        ).length,
        cancelledInterviews: interviews.filter((i) => i.status === "cancelled")
          .length,
        averageIntegrityScore:
          interviews.length > 0
            ? Math.round(
                interviews.reduce(
                  (acc, i) => acc + (i.integrityScore || 100),
                  0
                ) / interviews.length
              )
            : 100,
      };

      setDashboardStats(stats);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  };

  if (isLoadingStats && loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100">
          {hasRole("interviewer")
            ? "Manage your interviews and monitor candidate performance"
            : hasRole("candidate")
            ? "Your upcoming interviews and results are ready"
            : "System overview and analytics dashboard"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Interviews"
          value={dashboardStats.totalInterviews}
          icon={Calendar}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Scheduled"
          value={dashboardStats.scheduledInterviews}
          icon={Clock}
          color="yellow"
          trend="+3%"
        />
        <StatCard
          title="Completed"
          value={dashboardStats.completedInterviews}
          icon={CheckCircle}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Avg. Integrity Score"
          value={`${dashboardStats.averageIntegrityScore}%`}
          icon={TrendingUp}
          color="purple"
          trend="+2%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Interviews */}
        <div className="lg:col-span-2">
          <RecentInterviews interviews={interviews.slice(0, 5)} />
        </div>

        {/* Upcoming Interviews */}
        <div>
          <UpcomingInterviews
            interviews={interviews
              .filter(
                (i) =>
                  i.status === "scheduled" &&
                  new Date(i.scheduledAt) > new Date()
              )
              .slice(0, 3)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hasRole("interviewer") && (
            <QuickAction
              title="Schedule Interview"
              description="Create a new interview session"
              icon={Calendar}
              to="/interviews/create"
              color="primary"
            />
          )}
          <QuickAction
            title="View Reports"
            description="Access interview reports"
            icon={FileText}
            to="/reports"
            color="green"
          />
          {hasRole("candidate") && (
            <QuickAction
              title="Join Interview"
              description="Join your scheduled interview"
              icon={Play}
              to="/interviews"
              color="blue"
            />
          )}
          <QuickAction
            title="Settings"
            description="Manage your preferences"
            icon={Users}
            to="/settings"
            color="gray"
          />
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// Quick Action Component
const QuickAction = ({ title, description, icon: Icon, to, color }) => {
  const colorClasses = {
    primary: "text-primary-600 bg-primary-50 hover:bg-primary-100",
    green: "text-green-600 bg-green-50 hover:bg-green-100",
    blue: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    gray: "text-gray-600 bg-gray-50 hover:bg-gray-100",
  };

  return (
    <Link
      to={to}
      className={`p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 ${colorClasses[color]}`}
    >
      <div className="flex items-center space-x-3">
        <Icon size={20} />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm opacity-75">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
