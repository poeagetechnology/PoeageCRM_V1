import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { attendanceService } from "@/services/attendanceService";
import { Button } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import type { AttendanceRecord } from "@/types";

export function PunchInOutPage() {
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    loadTodayRecord();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayRecord = async () => {
    try {
      setLoading(true);
      if (user?.uid) {
        const data = await attendanceService.getTodayRecord(user.uid);
        setRecord(data);
      }
    } catch (error) {
      console.error("Error loading record:", error);
      showError("Failed to load attendance record");
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      const newRecord = await attendanceService.punchIn(
        user.uid,
        user.displayName,
        user.email,
      );
      setRecord(newRecord);
      showSuccess("Punched in successfully!");
    } catch (error: any) {
      showError(error.message || "Failed to punch in");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePunchOut = async () => {
    if (!user || !record) return;
    try {
      setSubmitting(true);
      await attendanceService.punchOut(user.uid, record.id);
      await loadTodayRecord();
      showSuccess("Punched out successfully!");
    } catch (error: any) {
      showError(error.message || "Failed to punch out");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isPunchedIn = record?.status === "punched_in";
  const isPunchedOut = record?.status === "punched_out";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          Time Tracking
        </h1>
        <p className="text-theme-muted">
          Manage your daily punch in/out records
        </p>
      </div>

      {/* Main Clock Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Time */}
        <div className="card p-8 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-brand-500/10 border-2 border-brand-500/30 flex items-center justify-center mb-6">
            <Clock size={40} className="text-brand-400" />
          </div>
          <div className="text-5xl font-bold text-white font-mono mb-2">
            {formatTime(time)}
          </div>
          <div className="text-theme-muted text-sm">Current time</div>
          <div className="text-xs text-theme-faint mt-4">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Status Card */}
        <div className="card p-8 flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-6">
              Today's Status
            </h2>

            {!loading && !record && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle
                    size={18}
                    className="text-yellow-500 flex-shrink-0"
                  />
                  <span className="text-sm text-yellow-500">
                    No punch in recorded yet
                  </span>
                </div>
              </div>
            )}

            {record && (
              <div className="space-y-4">
                <div>
                  <div className="text-theme-faint text-sm mb-1">
                    Punch In Time
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatDateTime(record.punchInTime)}
                  </div>
                </div>

                {isPunchedOut && record.punchOutTime && (
                  <>
                    <div>
                      <div className="text-theme-faint text-sm mb-1">
                        Punch Out Time
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatDateTime(record.punchOutTime)}
                      </div>
                    </div>

                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <div className="text-theme-faint text-sm mb-1">
                        Total Hours Worked
                      </div>
                      <div className="text-3xl font-bold text-success">
                        {record.workingHours?.toFixed(2)} hrs
                      </div>
                    </div>
                  </>
                )}

                {isPunchedIn && (
                  <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-4">
                    <div className="text-theme-faint text-sm">Status</div>
                    <div className="text-lg font-semibold text-brand-400 mt-1">
                      Currently Punched In
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {!isPunchedIn ? (
              <Button
                onClick={handlePunchIn}
                disabled={loading || submitting || isPunchedOut}
                loading={submitting}
                size="lg"
                className="flex-1 justify-center gap-2"
              >
                <LogIn size={18} />
                Punch In
              </Button>
            ) : (
              <Button
                onClick={handlePunchOut}
                disabled={submitting}
                loading={submitting}
                variant="danger"
                size="lg"
                className="flex-1 justify-center gap-2"
              >
                <LogOut size={18} />
                Punch Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Today's Hours
          </div>
          <div className="text-2xl font-bold text-white">
            {record?.workingHours?.toFixed(2) || "0.00"}h
          </div>
        </div>

        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Status
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isPunchedIn
                  ? "bg-brand-400"
                  : isPunchedOut
                    ? "bg-success"
                    : "bg-theme-faint"
              }`}
            />
            <span className="text-sm font-medium text-white capitalize">
              {record?.status.replace("_", " ") || "Not started"}
            </span>
          </div>
        </div>

        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Employee
          </div>
          <div className="text-sm font-medium text-white truncate">
            {user?.displayName}
          </div>
        </div>
      </div>
    </div>
  );
}
