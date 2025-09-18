import React from "react";

const Loading = ({
  size = "medium",
  color = "primary",
  text = "Loading...",
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
    xlarge: "h-16 w-16",
  };

  const colorClasses = {
    primary: "border-primary-600",
    white: "border-white",
    gray: "border-gray-600",
    success: "border-green-600",
    danger: "border-red-600",
    warning: "border-yellow-600",
  };

  const spinnerElement = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-4 border-solid border-t-transparent rounded-full animate-spin
        `}
      />
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      {spinnerElement}
    </div>
  );
};

// Different loading spinner variants
export const SpinnerDots = ({ className = "" }) => (
  <div className={`flex space-x-2 ${className}`}>
    <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
    <div
      className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
      style={{ animationDelay: "0.1s" }}
    ></div>
    <div
      className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
      style={{ animationDelay: "0.2s" }}
    ></div>
  </div>
);

export const SpinnerPulse = ({ className = "" }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-3 h-12 bg-primary-600 animate-pulse"></div>
    <div
      className="w-3 h-12 bg-primary-600 animate-pulse"
      style={{ animationDelay: "0.1s" }}
    ></div>
    <div
      className="w-3 h-12 bg-primary-600 animate-pulse"
      style={{ animationDelay: "0.2s" }}
    ></div>
  </div>
);

export const LoadingScreen = ({ message = "Initializing application..." }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
    <div className="text-center text-white">
      <div className="mb-6">
        <div className="h-16 w-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      <h2 className="text-xl font-semibold mb-2">ProctorAI</h2>
      <p className="text-primary-100">{message}</p>
    </div>
  </div>
);

export default Loading;
