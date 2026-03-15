/**
 * LearnLens Backend Integration Service
 * Connects to the FastAPI Python backend for robust PDF/Image extraction and AI analysis.
 * Supports Firebase Storage + Firestore history.
 */

const BACKEND_URL = 'http://localhost:8000';

export const analyzeDocument = async (file, signal, userId) => {
  try {
    console.log("🚀 Sending document to LearnLens AI Backend...");

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
      formData.append('user_id', userId);
    }

    const response = await fetch(`${BACKEND_URL}/analyze-marks`, {
      method: "POST",
      body: formData,
      signal: signal,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Server returned ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Analysis Received:", data);

    // Transform backend data to match LearnLens Dashboard state requirements
    return processBackendData(data);

  } catch (error) {
    console.error("❌ Backend Analysis Failed:", error.message);
    throw error;
  }
};

/**
 * Fetches analysis history for a user from the backend (Firestore).
 */
export const fetchAnalysisHistory = async (userId) => {
  try {
    console.log("📚 Fetching analysis history for:", userId);

    const response = await fetch(`${BACKEND_URL}/analysis-history/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Loaded ${data.count} history records`);

    // Transform each history record into Dashboard format
    return data.history.map(record => processHistoryRecord(record));

  } catch (error) {
    console.error("❌ History fetch failed:", error.message);
    return [];
  }
};

/**
 * Deletes an analysis record from the backend/Firebase.
 */
export const deleteAnalysis = async (docId) => {
  try {
    console.log("🗑️ Deleting analysis record:", docId);

    const response = await fetch(`${BACKEND_URL}/delete-analysis/${docId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Deletion failed');
    }

    console.log("✅ Record deleted successfully");
    return true;

  } catch (error) {
    console.error("❌ Deletion failed:", error.message);
    throw error;
  }
};

/**
 * Downloads the AI Insights PDF Report.
 * Sends analysis data to backend, receives PDF, triggers browser download.
 */
export const downloadInsightsReport = async (analysisData) => {
  try {
    console.log("📄 Generating PDF report...");

    const response = await fetch(`${BACKEND_URL}/generate-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjects: analysisData.subjects?.map(s => s.name) || [],
        marks: analysisData.subjects?.map(s => s.marks) || [],
        weak_subjects: analysisData.ai_insights?.weak_subjects || [],
        average_percentage: analysisData.ai_insights?.average_percentage ||
          Math.round(analysisData.subjects?.reduce((a, b) => a + b.marks, 0) / (analysisData.subjects?.length || 1)) + '%',
        performance_trend: analysisData.ai_insights?.performance_trend || 'N/A',
        predicted_next_exam_score: analysisData.ai_insights?.predicted_score || 'N/A',
        study_plan: analysisData.ai_insights?.study_plan || [],
        recommendations: analysisData.ai_insights?.recommendations || []
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Report generation failed');
    }

    // Download the PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LearnLens_Insights_Report.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    console.log("✅ Report downloaded!");
    return true;

  } catch (error) {
    console.error("❌ Report download failed:", error.message);
    throw error;
  }
};

/**
 * Transforms the flat backend analysis into the structured record format
 * expected by the React Dashboard (Dashboard.jsx).
 */
const processBackendData = (rawResponse) => {
  const analysis = rawResponse.analysis;

  // Calculate a mock SGPA based on the average percentage (e.g., 85% -> 8.5)
  const avgPercent = parseFloat(analysis.average_percentage.replace('%', ''));
  const sgpa = isNaN(avgPercent) ? 0 : (avgPercent / 10).toFixed(2);

  return {
    id: `rec_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    filename: rawResponse.filename,
    file_url: rawResponse.file_url || null,
    history_id: rawResponse.history_id || null,
    semester: "Semester Analysis",
    course: "Academic Course",
    institution: "LearnLens AI analysis",
    sgpa: parseFloat(sgpa),

    // Map backend arrays [subjects] and [marks] into objects the UI expects
    subjects: analysis.subjects.map((name, index) => {
      const marks = analysis.marks[index] || 0;
      return {
        name: name,
        marks: marks,
        grade: calculateGrade(marks),
        credits: 4,
        performance: marks < 50 ? 'Weak' : marks < 75 ? 'Average' : 'Strong'
      };
    }),

    // Store additional AI insights for future enhanced views
    ai_insights: {
      weak_subjects: analysis.weak_subjects,
      performance_trend: analysis.performance_trend,
      predicted_score: analysis.predicted_next_exam_score,
      study_plan: analysis.study_plan,
      recommendations: analysis.recommendations
    }
  };
};

/**
 * Transforms a Firestore history record into Dashboard format.
 */
const processHistoryRecord = (record) => {
  const avgPercent = parseFloat((record.average_percentage || '0').replace('%', ''));
  const sgpa = isNaN(avgPercent) ? 0 : (avgPercent / 10).toFixed(2);

  return {
    id: record.id || `hist_${Date.now()}`,
    date: record.timestamp ? record.timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
    filename: record.filename || 'Uploaded Marksheet',
    file_url: record.file_url || null,
    semester: "Semester Analysis",
    course: "Academic Course",
    institution: "LearnLens AI analysis",
    sgpa: parseFloat(sgpa),

    subjects: (record.subjects || []).map((name, index) => {
      const marks = (record.marks || [])[index] || 0;
      return {
        name: name,
        marks: marks,
        grade: calculateGrade(marks),
        credits: 4,
        performance: marks < 50 ? 'Weak' : marks < 75 ? 'Average' : 'Strong'
      };
    }),

    ai_insights: {
      weak_subjects: record.weak_subjects || [],
      performance_trend: record.performance_trend || 'N/A',
      predicted_score: record.predicted_next_exam_score || 'N/A',
      study_plan: record.study_plan || [],
      recommendations: record.recommendations || []
    }
  };
};

/**
 * Standard grade calculation helper
 */
const calculateGrade = (marks) => {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  return 'F';
};