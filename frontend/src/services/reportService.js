const PDFDocument = require("pdfkit");
const fs = require("fs").promises;
const path = require("path");
const Interview = require("../../../backend/src/models/Interview");
const DetectionLog = require("../../../backend/src/models/DetectionLog");
const User = require("../../../backend/src/models/User");

class ReportService {
  // Generate comprehensive proctoring report
  async generateProctoringReport(interviewId) {
    try {
      // Fetch interview data with populated fields
      const interview = await Interview.findById(interviewId)
        .populate("candidate", "name email")
        .populate("interviewer", "name email");

      if (!interview) {
        throw new Error("Interview not found");
      }

      // Fetch all detection logs for this interview
      const detectionLogs = await DetectionLog.find({
        interview: interviewId,
      }).sort({ timestamp: 1 });

      // Calculate comprehensive statistics
      const stats = this.calculateInterviewStats(detectionLogs, interview);

      // Generate PDF report
      const pdfBuffer = await this.createPDFReport(
        interview,
        detectionLogs,
        stats
      );

      // Save report metadata
      const reportData = {
        interviewId,
        stats,
        generatedAt: new Date(),
        filename: `interview-report-${interviewId}-${Date.now()}.pdf`,
      };

      return {
        pdfBuffer,
        reportData,
        stats,
      };
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  // Calculate detailed statistics
  calculateInterviewStats(detectionLogs, interview) {
    const totalDuration = interview.duration * 60; // Convert to seconds

    // Initialize counters
    const stats = {
      totalDuration,
      totalViolations: detectionLogs.length,
      violationsByType: {},
      violationsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      timeline: [],
      focusAnalysis: {
        totalFocusLost: 0,
        averageFocusLossDuration: 0,
        longestFocusLoss: 0,
        focusPercentage: 100,
      },
      objectDetection: {
        phoneDetected: 0,
        booksDetected: 0,
        devicesDetected: 0,
        otherViolations: 0,
      },
      integrityMetrics: {
        finalScore: interview.integrityScore,
        initialScore: 100,
        totalDeduction: 100 - interview.integrityScore,
        riskLevel: this.calculateRiskLevel(interview.integrityScore),
      },
    };

    // Process each detection log
    detectionLogs.forEach((log, index) => {
      // Count by type
      stats.violationsByType[log.type] =
        (stats.violationsByType[log.type] || 0) + 1;

      // Count by severity
      stats.violationsBySeverity[log.severity]++;

      // Timeline entry
      stats.timeline.push({
        timestamp: log.timestamp,
        type: log.type,
        severity: log.severity,
        confidence: log.confidence,
        details: log.details,
      });

      // Focus-specific analysis
      if (log.type === "focus_lost") {
        stats.focusAnalysis.totalFocusLost++;
        if (log.details?.duration) {
          stats.focusAnalysis.averageFocusLossDuration += log.details.duration;
          stats.focusAnalysis.longestFocusLoss = Math.max(
            stats.focusAnalysis.longestFocusLoss,
            log.details.duration
          );
        }
      }

      // Object detection analysis
      if (log.type === "phone_detected") stats.objectDetection.phoneDetected++;
      else if (log.type === "book_detected")
        stats.objectDetection.booksDetected++;
      else if (log.type === "device_detected")
        stats.objectDetection.devicesDetected++;
      else if (log.type.includes("_detected"))
        stats.objectDetection.otherViolations++;
    });

    // Calculate averages
    if (stats.focusAnalysis.totalFocusLost > 0) {
      stats.focusAnalysis.averageFocusLossDuration /=
        stats.focusAnalysis.totalFocusLost;
    }

    // Calculate focus percentage
    const totalFocusLossTime =
      stats.focusAnalysis.averageFocusLossDuration *
      stats.focusAnalysis.totalFocusLost;
    stats.focusAnalysis.focusPercentage = Math.max(
      0,
      100 - (totalFocusLossTime / (totalDuration * 1000)) * 100
    );

    return stats;
  }

  // Calculate risk level based on integrity score
  calculateRiskLevel(score) {
    if (score >= 90) return "Low";
    if (score >= 70) return "Medium";
    if (score >= 50) return "High";
    return "Critical";
  }

  // Create PDF report document
  async createPDFReport(interview, detectionLogs, stats) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        // Header
        this.addHeader(doc, interview);

        // Executive Summary
        this.addExecutiveSummary(doc, stats);

        // Detailed Statistics
        this.addDetailedStats(doc, stats);

        // Timeline Analysis
        this.addTimelineAnalysis(doc, stats);

        // Recommendations
        this.addRecommendations(doc, stats);

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Add report header
  addHeader(doc, interview) {
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Video Proctoring Report", 50, 50);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString()}`, 50, 80);

    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Interview Details
    doc.fontSize(14).font("Helvetica-Bold").text("Interview Details", 50, 120);

    const details = [
      ["Interview Title:", interview.title],
      ["Candidate:", interview.candidate.name],
      ["Candidate Email:", interview.candidate.email],
      ["Interviewer:", interview.interviewer.name],
      ["Date:", interview.scheduledAt.toLocaleDateString()],
      ["Duration:", `${interview.duration} minutes`],
      ["Status:", interview.status.toUpperCase()],
    ];

    let yPos = 140;
    details.forEach(([label, value]) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(label, 50, yPos)
        .font("Helvetica")
        .text(value, 150, yPos);
      yPos += 15;
    });
  }

  // Add executive summary
  addExecutiveSummary(doc, stats) {
    doc.addPage();

    doc.fontSize(16).font("Helvetica-Bold").text("Executive Summary", 50, 50);

    // Integrity Score Box
    doc.rect(50, 80, 200, 100).stroke();

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Final Integrity Score", 60, 90);

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor(this.getScoreColor(stats.integrityMetrics.finalScore))
      .text(`${stats.integrityMetrics.finalScore}/100`, 60, 110)
      .fillColor("black");

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Risk Level: ${stats.integrityMetrics.riskLevel}`, 60, 140);

    // Key Metrics
    const metrics = [
      ["Total Violations:", stats.totalViolations],
      ["Focus Lost Events:", stats.focusAnalysis.totalFocusLost],
      [
        "Objects Detected:",
        stats.objectDetection.phoneDetected +
          stats.objectDetection.booksDetected +
          stats.objectDetection.devicesDetected,
      ],
      [
        "Focus Percentage:",
        `${Math.round(stats.focusAnalysis.focusPercentage)}%`,
      ],
    ];

    let yPos = 200;
    doc.fontSize(12).font("Helvetica-Bold").text("Key Metrics", 50, yPos);

    yPos += 20;
    metrics.forEach(([label, value]) => {
      doc.fontSize(10).font("Helvetica").text(`${label} ${value}`, 50, yPos);
      yPos += 15;
    });
  }

  // Add detailed statistics
  addDetailedStats(doc, stats) {
    doc.addPage();

    doc.fontSize(16).font("Helvetica-Bold").text("Detailed Analysis", 50, 50);

    let yPos = 80;

    // Violation breakdown by type
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Violations by Type", 50, yPos);

    yPos += 20;
    Object.entries(stats.violationsByType).forEach(([type, count]) => {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${type.replace(/_/g, " ").toUpperCase()}: ${count}`, 60, yPos);
      yPos += 15;
    });

    yPos += 20;

    // Severity breakdown
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Violations by Severity", 50, yPos);

    yPos += 20;
    Object.entries(stats.violationsBySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`${severity.toUpperCase()}: ${count}`, 60, yPos);
        yPos += 15;
      }
    });
  }

  // Add timeline analysis
  addTimelineAnalysis(doc, stats) {
    if (stats.timeline.length === 0) return;

    doc.addPage();

    doc.fontSize(16).font("Helvetica-Bold").text("Timeline Analysis", 50, 50);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Chronological list of detected violations:", 50, 70);

    let yPos = 90;
    const maxItemsPerPage = 30;
    let itemCount = 0;

    stats.timeline.forEach((event, index) => {
      if (itemCount >= maxItemsPerPage) {
        doc.addPage();
        yPos = 50;
        itemCount = 0;
      }

      const time = new Date(event.timestamp).toLocaleTimeString();
      const type = event.type.replace(/_/g, " ").toUpperCase();
      const confidence = Math.round(event.confidence * 100);

      doc
        .fontSize(8)
        .font("Helvetica")
        .text(`${time} - ${type} (${confidence}% confidence)`, 50, yPos);

      yPos += 12;
      itemCount++;
    });
  }

  // Add recommendations
  addRecommendations(doc, stats) {
    doc.addPage();

    doc.fontSize(16).font("Helvetica-Bold").text("Recommendations", 50, 50);

    const recommendations = this.generateRecommendations(stats);

    let yPos = 80;
    recommendations.forEach((rec, index) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${rec.title}`, 50, yPos);

      yPos += 15;

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(rec.description, 60, yPos, { width: 480 });

      yPos += 25;
    });
  }

  // Generate recommendations based on stats
  generateRecommendations(stats) {
    const recommendations = [];

    if (stats.integrityMetrics.finalScore < 70) {
      recommendations.push({
        title: "High Risk Assessment",
        description:
          "This interview session shows significant integrity concerns. Consider conducting a follow-up interview or additional verification measures.",
      });
    }

    if (stats.focusAnalysis.totalFocusLost > 5) {
      recommendations.push({
        title: "Focus Management",
        description:
          "Multiple instances of focus loss detected. Recommend shorter interview segments or additional engagement techniques.",
      });
    }

    if (stats.objectDetection.phoneDetected > 0) {
      recommendations.push({
        title: "Device Security",
        description:
          "Mobile devices were detected during the interview. Implement stricter device policies for future sessions.",
      });
    }

    if (
      stats.violationsBySeverity.high + stats.violationsBySeverity.critical >
      0
    ) {
      recommendations.push({
        title: "Security Protocols",
        description:
          "High-severity violations detected. Review and strengthen proctoring protocols and candidate guidelines.",
      });
    }

    return recommendations;
  }

  // Add footer
  addFooter(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 30);

      doc.text(
        "Generated by Focus Detection Proctoring System",
        doc.page.width - 250,
        doc.page.height - 30
      );
    }
  }

  // Get color based on score
  getScoreColor(score) {
    if (score >= 90) return "#10B981"; // Green
    if (score >= 70) return "#F59E0B"; // Yellow
    if (score >= 50) return "#EF4444"; // Red
    return "#7F1D1D"; // Dark red
  }

  // Export report data to CSV
  async exportToCSV(interviewId) {
    try {
      const interview = await Interview.findById(interviewId).populate(
        "candidate",
        "name email"
      );

      const detectionLogs = await DetectionLog.find({
        interview: interviewId,
      }).sort({ timestamp: 1 });

      const csvData = [];
      csvData.push(["Timestamp", "Type", "Severity", "Confidence", "Details"]);

      detectionLogs.forEach((log) => {
        csvData.push([
          log.timestamp.toISOString(),
          log.type,
          log.severity,
          log.confidence,
          JSON.stringify(log.details),
        ]);
      });

      const csvContent = csvData
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return csvContent;
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      throw error;
    }
  }
}

module.exports = new ReportService();
