import { useState, useEffect } from "react";
import { Calendar, Download, Search, Loader2 } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { attendanceService } from "@/services/attendanceService";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import type { AttendanceRecord } from "@/types";

export function AttendanceHistoryPage() {
  const { user } = useAuthStore();
  const { error: showError } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<"personal" | "all">(
    user?.role === "hr" ||
      user?.role === "admin" ||
      user?.role === "super_admin"
      ? "all"
      : "personal",
  );

  useEffect(() => {
    loadAttendance();
  }, [viewMode]);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, startDate, endDate, records]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      let data: AttendanceRecord[] = [];

      if (viewMode === "personal" && user?.uid) {
        data = await attendanceService.getUserAttendance(user.uid, 100);
      } else {
        data = await attendanceService.getAllAttendance(500);
      }

      setRecords(data);
    } catch (error: any) {
      console.error("Error loading attendance:", error);
      showError("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (startDate) {
      filtered = filtered.filter((r) => r.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((r) => r.date <= endDate);
    }

    setFilteredRecords(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Employee Name",
      "Email",
      "Punch In Time",
      "Punch Out Time",
      "Hours Worked",
      "Status",
    ];

    const csvData = filteredRecords.map((r) => [
      r.date,
      r.userName,
      r.userEmail,
      new Date(r.punchInTime).toLocaleTimeString(),
      r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString() : "-",
      r.workingHours?.toFixed(2) || "-",
      r.status,
    ]);

    const csv = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "punched_in":
        return "text-brand-400 bg-brand-500/10";
      case "punched_out":
        return "text-success bg-success/10";
      case "absent":
        return "text-danger bg-danger/10";
      default:
        return "text-theme-muted bg-theme-muted/10";
    }
  };

  const canViewAll =
    user?.role === "hr" ||
    user?.role === "admin" ||
    user?.role === "super_admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          Attendance History
        </h1>
        <p className="text-theme-muted">
          {viewMode === "personal"
            ? "View your attendance records"
            : "View all employee attendance records"}
        </p>
      </div>

      {/* Filter Section */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              icon={<Search size={14} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>

          <Button onClick={exportToCSV} variant="secondary" size="md">
            <Download size={16} />
            Export CSV
          </Button>
        </div>

        {/* View Mode Toggle */}
        {canViewAll && (
          <div className="flex gap-2 pt-2 border-t border-white/5">
            <button
              onClick={() => setViewMode("personal")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "personal"
                  ? "bg-brand-500 text-white"
                  : "bg-white/5 text-theme-muted hover:bg-white/10"
              }`}
            >
              My Records
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-brand-500 text-white"
                  : "bg-white/5 text-theme-muted hover:bg-white/10"
              }`}
            >
              All Records
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Total Records
          </div>
          <div className="text-2xl font-bold text-white">
            {filteredRecords.length}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Punched In
          </div>
          <div className="text-2xl font-bold text-brand-400">
            {filteredRecords.filter((r) => r.status === "punched_in").length}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Punched Out
          </div>
          <div className="text-2xl font-bold text-success">
            {filteredRecords.filter((r) => r.status === "punched_out").length}
          </div>
        </div>

        <div className="card p-4">
          <div className="text-theme-faint text-xs font-medium uppercase mb-2">
            Total Hours
          </div>
          <div className="text-2xl font-bold text-white">
            {filteredRecords
              .reduce((sum, r) => sum + (r.workingHours || 0), 0)
              .toFixed(2)}
            h
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-theme-muted">
            <Loader2 size={18} className="animate-spin" />
            Loading records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-theme-muted">
            <Calendar size={32} className="mx-auto mb-3 opacity-50" />
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-faint uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-faint uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-faint uppercase">
                    Punch In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-faint uppercase">
                    Punch Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-faint uppercase">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-theme-faint uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-white">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {record.userName}
                        </div>
                        <div className="text-xs text-theme-faint">
                          {record.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatDateTime(record.punchInTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {record.punchOutTime
                        ? formatDateTime(record.punchOutTime)
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-white">
                        {record.workingHours
                          ? `${record.workingHours.toFixed(2)}h`
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          record.status,
                        )}`}
                      >
                        {record.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
