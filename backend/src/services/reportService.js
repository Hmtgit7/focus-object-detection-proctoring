const PDFDocument = require("pdfkit");
const fs = require("fs").promises;
const path = require("path");
const Interview = require("../models/Interview");
const DetectionLog = require("../models/DetectionLog");
const User = require("../models/User");

class ReportService {
  // Export interview data to CSV
  async exportToCSV(interviewId) {
    try {
      console.log("📊 Exporting CSV for interview:", interviewId);
      
      // Fetch interview data with populated fields
      const interview = await Interview.findById(interviewId)
        .populate("candidate", "name email")
        .populate("interviewer", "name email");

      if (!interview) {
        throw new Error("Interview not found");
      }

      // Fetch detection logs
      const detectionLogs = await DetectionLog.find({ interviewId })
        .sort({ timestamp: 1 });

      // Create CSV headers
      const headers = [
        "Timestamp",
        "Detection Type",
        "Confidence",
        "Severity",
        "Description",
        "Duration (ms)"
      ];

      // Create CSV rows
      const rows = detectionLogs.map(log => [
        log.timestamp.toISOString(),
        log.type,
        log.confidence || "N/A",
        log.severity || "N/A",
        log.description || "N/A",
        log.duration || "N/A"
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(","))
        .join("\n");

      return csvContent;
    } catch (error) {
      console.error("CSV export error:", error);
      throw error;
    }
  }

  // Generate comprehensive proctoring report
  async generateProctoringReport(interviewId) {
    try {
      console.log("📊 Generating report for interview:", interviewId);
      
      // Fetch interview data with populated fields
      const interview = await Interview.findById(interviewId)
        .populate("candidate", "name email")
        .populate("interviewer", "name email");

      if (!interview) {
        throw new Error("Interview not found");
      }

      console.log("📊 Interview data:", {
        id: interview._id,
        title: interview.title,
        status: interview.status,
        candidate: interview.candidate?.name,
        interviewer: interview.interviewer?.name
      });

      // Fetch all detection logs for this interview
      const detectionLogs = await DetectionLog.find({
        interview: interviewId,
      }).sort({ timestamp: 1 });

      console.log("📊 Detection logs found:", detectionLogs.length);

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
      console.error("❌ Error generating report:", error);
      throw error;
    }
  }

  // Calculate detailed statistics
  calculateInterviewStats(detectionLogs, interview) {
    const totalDuration = interview.duration * 60; // Convert to seconds
    const startTime = interview.startedAt || new Date();
    const endTime = interview.endedAt || new Date();
    const actualDuration = Math.floor((endTime - startTime) / 1000);

    // Initialize counters
    const violationTypes = {
      face_absent: 0,
      multiple_faces: 0,
      phone_detected: 0,
      unauthorized_person: 0,
      focus_lost: 0,
      audio_violation: 0,
    };

    const timeline = [];
    let totalViolations = 0;
    let criticalViolations = 0;

    // Process detection logs
    detectionLogs.forEach((log) => {
      const violationType = log.detectionType || 'unknown';
      violationTypes[violationType] = (violationTypes[violationType] || 0) + 1;
      totalViolations++;

      // Mark critical violations
      if (['phone_detected', 'unauthorized_person'].includes(violationType)) {
        criticalViolations++;
      }

      timeline.push({
        timestamp: log.timestamp,
        type: violationType,
        confidence: log.confidence || 0,
        details: log.data || {},
      });
    });

    // Calculate focus metrics
    const focusLogs = detectionLogs.filter(log => 
      log.detectionType === 'focus_lost' || log.detectionType === 'face_absent'
    );
    const focusLossPercentage = totalDuration > 0 ? 
      (focusLogs.length / totalDuration) * 100 : 0;

    // Calculate integrity score
    const baseScore = 100;
    const violationPenalty = totalViolations * 2; // 2 points per violation
    const criticalPenalty = criticalViolations * 10; // 10 points per critical violation
    const focusPenalty = Math.min(focusLossPercentage * 0.5, 20); // Max 20 points for focus issues
    
    const integrityScore = Math.max(0, baseScore - violationPenalty - criticalPenalty - focusPenalty);

    // Generate insights
    const insights = {
      patterns: [],
      riskFactors: [],
      recommendations: [],
    };

    // Identify concerning patterns
    if (violationTypes.focus_lost > 10) {
      insights.patterns.push("Frequent focus loss detected");
      insights.recommendations.push("Consider shorter interview segments");
    }

    if (violationTypes.phone_detected > 0) {
      insights.riskFactors.push("Mobile device usage detected");
      insights.recommendations.push("Implement stricter device policies");
    }

    if (violationTypes.unauthorized_person > 0) {
      insights.riskFactors.push("Unauthorized person detected");
      insights.recommendations.push("Verify candidate identity");
    }

    if (focusLossPercentage > 30) {
      insights.riskFactors.push("High focus loss percentage");
      insights.recommendations.push("Review candidate's environment setup");
    }

    return {
      interview: {
        id: interview._id,
        title: interview.title,
        candidate: interview.candidate?.name,
        interviewer: interview.interviewer?.name,
        scheduledAt: interview.scheduledAt,
        startedAt: interview.startedAt,
        endedAt: interview.endedAt,
        duration: interview.duration,
        actualDuration: Math.floor(actualDuration / 60), // Convert to minutes
      },
      violations: {
        total: totalViolations,
        critical: criticalViolations,
        byType: violationTypes,
      },
      focus: {
        lossPercentage: focusLossPercentage,
        totalLossEvents: focusLogs.length,
      },
      integrity: {
        score: Math.round(integrityScore),
        riskLevel: this.calculateRiskLevel(integrityScore),
      },
      timeline,
      insights,
      generatedAt: new Date(),
    };
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
      .text("Interview Proctoring Report", 50, 50)
      .fontSize(12)
      .font("Helvetica")
      .text(`Interview: ${interview.title}`, 50, 80)
      .text(`Candidate: ${interview.candidate?.name}`, 50, 95)
      .text(`Interviewer: ${interview.interviewer?.name}`, 50, 110)
      .text(`Date: ${interview.scheduledAt.toLocaleDateString()}`, 50, 125)
      .text(`Duration: ${interview.duration} minutes`, 50, 140)
      .moveDown(2);
  }

  // Add executive summary
  addExecutiveSummary(doc, stats) {
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Executive Summary", 50, doc.y)
      .fontSize(12)
      .font("Helvetica")
      .moveDown(1);

    const summary = `This interview was conducted for ${stats.interview.duration} minutes with an integrity score of ${stats.integrity.score}% (${stats.integrity.riskLevel} risk level). `;
    
    if (stats.violations.total > 0) {
      doc.text(summary + `A total of ${stats.violations.total} violations were detected, including ${stats.violations.critical} critical violations.`);
    } else {
      doc.text(summary + "No violations were detected during the interview.");
    }

    doc.moveDown(1);
  }

  // Add detailed statistics
  addDetailedStats(doc, stats) {
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Detailed Statistics", 50, doc.y)
      .fontSize(12)
      .font("Helvetica")
      .moveDown(1);

    // Violations table
    doc.text("Violations Summary:", 50, doc.y);
    doc.moveDown(0.5);

    Object.entries(stats.violations.byType).forEach(([type, count]) => {
      if (count > 0) {
        doc.text(`• ${type.replace('_', ' ').toUpperCase()}: ${count}`, 70, doc.y);
        doc.moveDown(0.3);
      }
    });

    doc.moveDown(1);

    // Focus metrics
    doc.text(`Focus Loss Percentage: ${stats.focus.lossPercentage.toFixed(2)}%`, 50, doc.y);
    doc.text(`Total Focus Loss Events: ${stats.focus.totalLossEvents}`, 50, doc.y + 15);
    doc.moveDown(1);
  }

  // Add timeline analysis
  addTimelineAnalysis(doc, stats) {
    if (stats.timeline.length === 0) return;

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Timeline Analysis", 50, doc.y)
      .fontSize(12)
      .font("Helvetica")
      .moveDown(1);

    // Show first 10 events to avoid page overflow
    const eventsToShow = stats.timeline.slice(0, 10);
    
    eventsToShow.forEach((event, index) => {
      const time = new Date(event.timestamp).toLocaleTimeString();
      doc.text(`${time} - ${event.type.replace('_', ' ').toUpperCase()} (${event.confidence}% confidence)`, 50, doc.y);
      doc.moveDown(0.3);
    });

    if (stats.timeline.length > 10) {
      doc.text(`... and ${stats.timeline.length - 10} more events`, 50, doc.y);
    }

    doc.moveDown(1);
  }

  // Add recommendations
  addRecommendations(doc, stats) {
    if (stats.insights.recommendations.length === 0) return;

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Recommendations", 50, doc.y)
      .fontSize(12)
      .font("Helvetica")
      .moveDown(1);

    stats.insights.recommendations.forEach((recommendation, index) => {
      doc.text(`${index + 1}. ${recommendation}`, 50, doc.y);
      doc.moveDown(0.5);
    });
  }

  // Add footer
  addFooter(doc) {
    const pageHeight = doc.page.height;
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Report generated on ${new Date().toLocaleString()}`, 50, pageHeight - 50)
      .text("ProctorAI - AI-Powered Interview Monitoring", 50, pageHeight - 35);
  }
}

module.exports = new ReportService();
