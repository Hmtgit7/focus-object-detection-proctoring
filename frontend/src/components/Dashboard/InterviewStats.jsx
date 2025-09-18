import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const InterviewStats = ({ stats = {} }) => {
  const {
    totalInterviews = 0,
    completedInterviews = 0,
    averageIntegrityScore = 100,
    totalViolations = 0,
    averageDuration = 0,
    successRate = 100,
  } = stats;

  const statCards = [
    {
      title: "Total Interviews",
      value: totalInterviews,
      icon: Users,
      color: "blue",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Completed",
      value: completedInterviews,
      icon: CheckCircle,
      color: "green",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Avg. Integrity Score",
      value: `${Math.round(averageIntegrityScore)}%`,
      icon: averageIntegrityScore >= 80 ? TrendingUp : TrendingDown,
      color: averageIntegrityScore >= 80 ? "green" : "red",
      change: averageIntegrityScore >= 80 ? "+2%" : "-3%",
      changeType: averageIntegrityScore >= 80 ? "increase" : "decrease",
    },
    {
      title: "Total Violations",
      value: totalViolations,
      icon: AlertTriangle,
      color: totalViolations > 50 ? "red" : "yellow",
      change: totalViolations > 50 ? "+15%" : "-5%",
      changeType: totalViolations > 50 ? "increase" : "decrease",
    },
    {
      title: "Avg. Duration",
      value: `${Math.round(averageDuration)}min`,
      icon: Clock,
      color: "purple",
      change: "+1min",
      changeType: "increase",
    },
    {
      title: "Success Rate",
      value: `${Math.round(successRate)}%`,
      icon: successRate >= 90 ? TrendingUp : TrendingDown,
      color: successRate >= 90 ? "green" : "yellow",
      change: successRate >= 90 ? "+1%" : "-2%",
      changeType: successRate >= 90 ? "increase" : "decrease",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = (changeType) => {
    return changeType === "increase" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${getChangeColor(
                      stat.changeType
                    )}`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InterviewStats;
