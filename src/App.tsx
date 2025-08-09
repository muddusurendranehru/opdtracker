"use client"

import { useMemo, useState } from "react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Checkbox } from "./components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Card, CardContent } from "./components/ui/card"
import { Separator } from "./components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog"
import { Badge } from "./components/ui/badge"
import { CalendarDays, Download, Plus, RefreshCw, Trash2, Cloud, CloudOff, Loader2, FileSpreadsheet, Calendar } from 'lucide-react'
import { cn } from "./components/lib/utils"
import { useSupabaseSync } from "./hooks/useSupabaseSync"
import * as XLSX from 'xlsx'

// Supabase status indicator component
function SupabaseStatus({ enabled, syncing, error }: { enabled: boolean; syncing: boolean; error: string | null }) {
  if (!enabled) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <CloudOff className="h-3 w-3" />
        <span>Local Storage Only</span>
      </div>
    );
  }
  
  if (syncing) {
    return (
      <div className="flex items-center gap-1 text-xs text-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Syncing to Cloud...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <CloudOff className="h-3 w-3" />
        <span>Sync Error</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-xs text-green-600">
      <Cloud className="h-3 w-3" />
      <span>Cloud Sync Active</span>
    </div>
  );
}

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)
}

function numberToIndianWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ]
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function twoDigits(n: number): string {
    if (n < 20) return a[n]
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return b[tens] + (ones ? ` ${a[ones]}` : "")
  }

  function threeDigits(n: number): string {
    const hundred = Math.floor(n / 100)
    const rest = n % 100
    return (hundred ? `${a[hundred]} Hundred` : "") + (rest ? (hundred ? " " : "") + twoDigits(rest) : "")
  }

  function convert(n: number): string {
    if (n === 0) return "Zero"
    let words = ""
    const crore = Math.floor(n / 10000000)
    n = n % 10000000
    const lakh = Math.floor(n / 100000)
    n = n % 100000
    const thousand = Math.floor(n / 1000)
    n = n % 1000
    const rest = n

    if (crore) words += `${threeDigits(crore)} Crore`
    if (lakh) words += (words ? " " : "") + `${threeDigits(lakh)} Lakh`
    if (thousand) words += (words ? " " : "") + `${threeDigits(thousand)} Thousand`
    if (rest) words += (words ? " " : "") + `${threeDigits(rest)}`
    return words
  }

  const rupees = Math.floor(num)
  const paise = Math.round((num - rupees) * 100)

  let result = rupees === 0 ? "Zero Rupees" : `Rupees ${convert(rupees)}`
  if (paise > 0) {
    result += ` and ${twoDigits(paise)} Paise`
  }
  return result + " Only"
}

function useTodayDate() {
  const now = new Date()
  const dayName = now.toLocaleDateString(undefined, { weekday: "long" })
  const formatted = now.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  return { dayName, formatted, iso }
}

function formatDateDisplay(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const dayName = date.toLocaleDateString(undefined, { weekday: "long" })
  const formatted = date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  return { dayName, formatted }
}
export default function App() {
  const { iso: todayIso } = useTodayDate()
  const [selectedDate, setSelectedDate] = useState(todayIso)
  const { dayName, formatted } = formatDateDisplay(selectedDate)
  
  const { 
    rows, 
    loading, 
    syncing, 
    error, 
    supabaseEnabled,
    testConnection,
    addRow, 
    updateRow, 
    removeRow, 
    clearDay, 
    computeRowTotal 
  } = useSupabaseSync(selectedDate)

  const dailyTotal = useMemo(() => rows.reduce((sum, r) => sum + computeRowTotal(r), 0), [rows, computeRowTotal])

  // Add sample patients for demonstration
  const addSamplePatients = () => {
    const samplePatients = [
      { name: "Rajesh Kumar", review: "Follow-up", free: false, amount: "500", includeTwoE: true, twoE: "200", includeLab: false, lab: "", obs: "BP normal, continue medication", includeExtra: false, extra: "" },
      { name: "Priya Sharma", review: "New Patient", free: false, amount: "800", includeTwoE: false, twoE: "", includeLab: true, lab: "300", obs: "Diabetes screening required", includeExtra: false, extra: "" },
      { name: "Mohammed Ali", review: "Consultation", free: true, amount: "", includeTwoE: false, twoE: "", includeLab: false, lab: "", obs: "Free consultation - community service", includeExtra: false, extra: "" },
      { name: "Sunita Devi", review: "Follow-up", free: false, amount: "400", includeTwoE: true, twoE: "150", includeLab: false, lab: "", obs: "Hypertension stable", includeExtra: false, extra: "" },
      { name: "Arjun Patel", review: "New Patient", free: false, amount: "600", includeTwoE: false, twoE: "", includeLab: true, lab: "250", obs: "Chest pain evaluation", includeExtra: true, extra: "100" },
      { name: "Kavita Singh", review: "Review", free: false, amount: "350", includeTwoE: true, twoE: "200", includeLab: false, lab: "", obs: "Thyroid levels normal", includeExtra: false, extra: "" },
      { name: "Deepak Gupta", review: "Consultation", free: false, amount: "450", includeTwoE: false, twoE: "", includeLab: true, lab: "400", obs: "Liver function tests", includeExtra: false, extra: "" },
      { name: "Meera Joshi", review: "Follow-up", free: false, amount: "300", includeTwoE: true, twoE: "150", includeLab: false, lab: "", obs: "Migraine improving", includeExtra: false, extra: "" },
      { name: "Vikram Yadav", review: "New Patient", free: false, amount: "700", includeTwoE: false, twoE: "", includeLab: true, lab: "350", obs: "Cardiac evaluation", includeExtra: true, extra: "200" },
      { name: "Anita Reddy", review: "Consultation", free: true, amount: "", includeTwoE: false, twoE: "", includeLab: false, lab: "", obs: "Senior citizen free checkup", includeExtra: false, extra: "" },
      { name: "Rohit Mehta", review: "Follow-up", free: false, amount: "400", includeTwoE: true, twoE: "180", includeLab: false, lab: "", obs: "Diabetes well controlled", includeExtra: false, extra: "" },
      { name: "Sushma Iyer", review: "Review", free: false, amount: "550", includeTwoE: false, twoE: "", includeLab: true, lab: "300", obs: "Kidney function normal", includeExtra: false, extra: "" },
      { name: "Amit Agarwal", review: "New Patient", free: false, amount: "650", includeTwoE: true, twoE: "200", includeLab: true, lab: "250", obs: "Complete health checkup", includeExtra: false, extra: "" },
      { name: "Pooja Bansal", review: "Consultation", free: false, amount: "380", includeTwoE: false, twoE: "", includeLab: false, lab: "", obs: "Skin allergy treatment", includeExtra: true, extra: "120" },
      { name: "Ravi Tiwari", review: "Follow-up", free: false, amount: "420", includeTwoE: true, twoE: "160", includeLab: true, lab: "200", obs: "Post-surgery recovery good", includeExtra: false, extra: "" }
    ];

    samplePatients.forEach(() => {
      addRow();
    });
  };

  function exportCSV() {
    const headers = [
      "Serial",
      "Patient Name",
      "Review",
      "Free",
      "Amount (₹)",
      "2E Included",
      "2E (₹)",
      "Lab Included",
      "Lab (₹)",
      "Obs",
      "Extra Included",
      "Extra (₹)",
      "Row Total (₹)",
      "Sync Status",
    ]
    const lines: string[] = []
    lines.push(headers.join(","))
    rows.forEach((r, idx) => {
      const total = computeRowTotal(r)
      const items = [
        String(idx + 1),
        csvEscape(r.name),
        csvEscape(r.review),
        r.free ? "Yes" : "No",
        String(r.free ? 0 : parseFloat(r.amount) || 0),
        r.includeTwoE ? "Yes" : "No",
        String(r.includeTwoE ? parseFloat(r.twoE) || 0 : 0),
        r.includeLab ? "Yes" : "No",
        String(r.includeLab ? parseFloat(r.lab) || 0 : 0),
        csvEscape(r.obs),
        r.includeExtra ? "Yes" : "No",
        String(r.includeExtra ? parseFloat(r.extra) || 0 : 0),
        String(total),
        r.synced ? "Synced" : "Local Only",
      ]
      lines.push(items.join(","))
    })
    lines.push("")
    lines.push(`"Daily Total Revenue (₹)",${dailyTotal}`)
    const content = lines.join("\n")
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `OPD-${selectedDate}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function exportExcel() {
    // Create worksheet data
    const worksheetData = [
      // Headers
      [
        "Serial",
        "Patient Name", 
        "Review",
        "Free",
        "Amount (₹)",
        "2E Included",
        "2E (₹)",
        "Lab Included", 
        "Lab (₹)",
        "Observations",
        "Extra Included",
        "Extra (₹)",
        "Row Total (₹)",
        "Sync Status"
      ],
      // Data rows
      ...rows.map((r, idx) => {
        const total = computeRowTotal(r)
        return [
          idx + 1,
          r.name,
          r.review,
          r.free ? "Yes" : "No",
          r.free ? 0 : parseFloat(r.amount) || 0,
          r.includeTwoE ? "Yes" : "No",
          r.includeTwoE ? parseFloat(r.twoE) || 0 : 0,
          r.includeLab ? "Yes" : "No",
          r.includeLab ? parseFloat(r.lab) || 0 : 0,
          r.obs,
          r.includeExtra ? "Yes" : "No",
          r.includeExtra ? parseFloat(r.extra) || 0 : 0,
          total,
          r.synced ? "Synced" : "Local Only"
        ]
      }),
      // Empty row
      [],
      // Summary row
      ["", "", "", "", "", "", "", "", "", "", "", "", `Daily Total: ₹${dailyTotal}`, ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", `In Words: ${numberToIndianWords(dailyTotal)}`, ""]
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // Serial
      { wch: 20 },  // Patient Name
      { wch: 15 },  // Review
      { wch: 8 },   // Free
      { wch: 12 },  // Amount
      { wch: 12 },  // 2E Included
      { wch: 10 },  // 2E Amount
      { wch: 12 },  // Lab Included
      { wch: 10 },  // Lab Amount
      { wch: 25 },  // Observations
      { wch: 12 },  // Extra Included
      { wch: 10 },  // Extra Amount
      { wch: 12 },  // Row Total
      { wch: 12 }   // Sync Status
    ]
    worksheet['!cols'] = columnWidths

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E3F2FD" } },
        alignment: { horizontal: "center" }
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `OPD ${formatted}`)

    // Save file
    XLSX.writeFile(workbook, `OPD-Clinic-${selectedDate}.xlsx`)
  }

  function csvEscape(s: string): string {
    if (s == null) return ""
    const needs = /[",\n]/.test(s)
    const escaped = s.replace(/"/g, '""')
    return needs ? `"${escaped}"` : escaped
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading clinic data...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full px-4 py-3 md:px-6 md:py-4 bg-white shadow-sm">
        <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-blue-600" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedDate === todayIso && (
                  <Badge variant="secondary" className="text-xs">Today</Badge>
                )}
              </div>
              <div className="text-2xl font-bold leading-tight text-gray-900">{dayName}</div>
              <div className="text-gray-600">{formatted}</div>
              <div className="mt-1">
                <SupabaseStatus enabled={supabaseEnabled} syncing={syncing} error={error} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={addRow} className="h-10 px-4 bg-blue-600 hover:bg-blue-700" title="Add Patient">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
            <Button onClick={addSamplePatients} variant="outline" className="h-10 px-4 bg-purple-50 hover:bg-purple-100 border-purple-200" title="Add Sample Patients">
              <Plus className="h-4 w-4 mr-2 text-purple-600" />
              Sample Data
            </Button>
            <Button variant="outline" onClick={exportCSV} className="h-10 px-4" title="Export CSV">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportExcel} className="h-10 px-4 bg-green-50 hover:bg-green-100 border-green-200" title="Export Excel">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Excel
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-10 px-4" title="Clear today's records">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Day
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear today&apos;s records?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all patient entries for {formatted} from both local storage and Supabase database. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearDay}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <section className="px-3 md:px-6 pb-36 md:pb-8 flex-1">
        {/* Mobile Card View */}
        <div className="md:hidden mt-6 space-y-4">
          {rows.map((r, idx) => {
            const rowTotal = computeRowTotal(r)
            return (
              <Card key={r.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="font-mono">
                      #{idx + 1}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-green-600">{formatINR(rowTotal)}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(r.id)}
                        className="h-8 w-8"
                        title="Remove patient"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Patient Name</label>
                      <Input
                        value={r.name}
                        onChange={(e) => updateRow(r.id, { name: e.target.value })}
                        placeholder="Patient name"
                        className="h-9"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Review</label>
                        <Input
                          value={r.review}
                          onChange={(e) => updateRow(r.id, { review: e.target.value })}
                          placeholder="Review"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Amount</label>
                        <div className="relative">
                          <span className={cn("pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500", r.free && "opacity-60")}>
                            ₹
                          </span>
                          <Input
                            type="number"
                            value={r.amount}
                            onChange={(e) => updateRow(r.id, { amount: e.target.value })}
                            placeholder={r.free ? "Free" : "Amount"}
                            className={cn("h-9 pl-6", r.free && "opacity-60")}
                            disabled={r.free}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={r.free}
                        onCheckedChange={(val) => updateRow(r.id, { free: Boolean(val) })}
                      />
                      <span className="text-sm">Free consultation</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <Checkbox
                          checked={r.includeTwoE}
                          onCheckedChange={(val) => updateRow(r.id, { includeTwoE: Boolean(val) })}
                        />
                        <div className="text-xs text-gray-600 mt-1">2E</div>
                        {r.includeTwoE && (
                          <Input
                            type="number"
                            value={r.twoE}
                            onChange={(e) => updateRow(r.id, { twoE: e.target.value })}
                            placeholder="₹"
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <Checkbox
                          checked={r.includeLab}
                          onCheckedChange={(val) => updateRow(r.id, { includeLab: Boolean(val) })}
                        />
                        <div className="text-xs text-gray-600 mt-1">Lab</div>
                        {r.includeLab && (
                          <Input
                            type="number"
                            value={r.lab}
                            onChange={(e) => updateRow(r.id, { lab: e.target.value })}
                            placeholder="₹"
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <Checkbox
                          checked={r.includeExtra}
                          onCheckedChange={(val) => updateRow(r.id, { includeExtra: Boolean(val) })}
                        />
                        <div className="text-xs text-gray-600 mt-1">Extra</div>
                        {r.includeExtra && (
                          <Input
                            type="number"
                            value={r.extra}
                            onChange={(e) => updateRow(r.id, { extra: e.target.value })}
                            placeholder="₹"
                            className="h-8 text-xs mt-1"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Observations</label>
                      <Input
                        value={r.obs}
                        onChange={(e) => updateRow(r.id, { obs: e.target.value })}
                        placeholder="Notes / observations"
                        className="h-9"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "h-4 w-4 rounded-full flex items-center justify-center",
                          r.synced ? "bg-green-100" : "bg-yellow-100"
                        )}>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            r.synced ? "bg-green-600" : "bg-yellow-600"
                          )} title={r.synced ? "Synced to cloud" : "Pending sync"} />
                        </div>
                        <span className="text-xs text-gray-500">
                          {r.synced ? "Synced" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Desktop Table View */}
        <Card className="border mt-6 hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="min-w-[64px] w-[72px]">S/N</TableHead>
                    <TableHead className="min-w-[200px]">Patient Name</TableHead>
                    <TableHead className="min-w-[140px]">Review</TableHead>
                    <TableHead className="min-w-[90px]">Free</TableHead>
                    <TableHead className="min-w-[150px]">Amount (₹)</TableHead>
                    <TableHead className="min-w-[160px]">2E (tick to add)</TableHead>
                    <TableHead className="min-w-[160px]">Lab (tick to add)</TableHead>
                    <TableHead className="min-w-[180px]">Obs</TableHead>
                    <TableHead className="min-w-[170px]">Extra (tick to add)</TableHead>
                    <TableHead className="min-w-[130px]">Total (₹)</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => {
                    const rowTotal = computeRowTotal(r)
                    const isAmountDisabled = r.free
                    return (
                      <TableRow key={r.id} className="align-top">
                        <TableCell className="pt-3">
                          <Badge variant="secondary" className="font-mono">
                            {idx + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="pt-2">
                          <Input
                            value={r.name}
                            onChange={(e) => updateRow(r.id, { name: e.target.value })}
                            placeholder="Patient name"
                            className="h-10"
                            aria-label="Patient Name"
                          />
                        </TableCell>
                        <TableCell className="pt-2">
                          <Input
                            value={r.review}
                            onChange={(e) => updateRow(r.id, { review: e.target.value })}
                            placeholder="Review"
                            className="h-10"
                            aria-label="Review"
                          />
                        </TableCell>
                        <TableCell className="pt-2">
                          <label className="flex items-center gap-2 h-10">
                            <Checkbox
                              checked={r.free}
                              onCheckedChange={(val) => updateRow(r.id, { free: Boolean(val) })}
                              aria-label="Free (no charge)"
                            />
                            <span className="text-sm">Free</span>
                          </label>
                        </TableCell>
                        <TableCell className="pt-2">
                          <div className="relative">
                            <span className={cn("pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500", isAmountDisabled && "opacity-60")}>
                              {"₹"}
                            </span>
                            <Input
                              type="number"
                              inputMode="numeric"
                              step="1"
                              min="0"
                              value={r.amount}
                              onChange={(e) => updateRow(r.id, { amount: e.target.value })}
                              placeholder={isAmountDisabled ? "Disabled" : "Amount"}
                              className={cn("h-10 pl-6", isAmountDisabled && "opacity-60")}
                              aria-label="Amount in Rupees"
                              disabled={isAmountDisabled}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="pt-2">
                          <div className="flex items-center gap-2 h-10">
                            <Checkbox
                              checked={r.includeTwoE}
                              onCheckedChange={(val) => updateRow(r.id, { includeTwoE: Boolean(val) })}
                              aria-label="Include 2E"
                            />
                            <div className="relative flex-1">
                              <span
                                className={cn(
                                  "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500",
                                  !r.includeTwoE && "opacity-60"
                                )}
                              >
                                {"₹"}
                              </span>
                              <Input
                                type="number"
                                inputMode="numeric"
                                step="1"
                                min="0"
                                value={r.twoE}
                                onChange={(e) => updateRow(r.id, { twoE: e.target.value })}
                                placeholder={r.includeTwoE ? "2E amount" : ""}
                                className={cn("h-10 pl-6", !r.includeTwoE && "opacity-60")}
                                aria-label="2E Amount in Rupees"
                                disabled={!r.includeTwoE}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pt-2">
                          <div className="flex items-center gap-2 h-10">
                            <Checkbox
                              checked={r.includeLab}
                              onCheckedChange={(val) => updateRow(r.id, { includeLab: Boolean(val) })}
                              aria-label="Include Lab"
                            />
                            <div className="relative flex-1">
                              <span
                                className={cn(
                                  "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500",
                                  !r.includeLab && "opacity-60"
                                )}
                              >
                                {"₹"}
                              </span>
                              <Input
                                type="number"
                                inputMode="numeric"
                                step="1"
                                min="0"
                                value={r.lab}
                                onChange={(e) => updateRow(r.id, { lab: e.target.value })}
                                placeholder={r.includeLab ? "Lab amount" : ""}
                                className={cn("h-10 pl-6", !r.includeLab && "opacity-60")}
                                aria-label="Lab Amount in Rupees"
                                disabled={!r.includeLab}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pt-2">
                          <Input
                            value={r.obs}
                            onChange={(e) => updateRow(r.id, { obs: e.target.value })}
                            placeholder="Observations / Notes"
                            className="h-10"
                            aria-label="Observations"
                          />
                        </TableCell>
                        <TableCell className="pt-2">
                          <div className="flex items-center gap-2 h-10">
                            <Checkbox
                              checked={r.includeExtra}
                              onCheckedChange={(val) => updateRow(r.id, { includeExtra: Boolean(val) })}
                              aria-label="Include Extra"
                            />
                            <div className="relative flex-1">
                              <span
                                className={cn(
                                  "pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500",
                                  !r.includeExtra && "opacity-60"
                                )}
                              >
                                {"₹"}
                              </span>
                              <Input
                                type="number"
                                inputMode="numeric"
                                step="1"
                                min="0"
                                value={r.extra}
                                onChange={(e) => updateRow(r.id, { extra: e.target.value })}
                                placeholder={r.includeExtra ? "Extra amount" : ""}
                                className={cn("h-10 pl-6", !r.includeExtra && "opacity-60")}
                                aria-label="Extra Amount in Rupees"
                                disabled={!r.includeExtra}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="pt-2 align-middle">
                          <div className="font-semibold text-green-600">{formatINR(rowTotal)}</div>
                        </TableCell>
                        <TableCell className="pt-2 align-middle">
                          <div className="flex items-center gap-1">
                            <div className={cn(
                              "h-4 w-4 rounded-full flex items-center justify-center",
                              r.synced ? "bg-green-100" : "bg-yellow-100"
                            )}>
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                r.synced ? "bg-green-600" : "bg-yellow-600"
                              )} title={r.synced ? "Synced to cloud" : "Pending sync"} />
                            </div>
                            <span className="text-xs text-gray-500">
                              {r.synced ? "Synced" : "Pending"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="pt-2 align-middle">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRow(r.id)}
                              className="h-9 w-9"
                              aria-label={`Remove row ${idx + 1}`}
                              title="Remove patient"
                            >
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 md:p-4">
              <div className="text-sm text-gray-600">
                Patients: {rows.length} | {supabaseEnabled ? 'Cloud Sync' : 'Local Only'}
              </div>
              <div className="space-y-1 md:space-y-0 md:flex md:items-baseline md:gap-4">
                <div className="text-sm">
                  Daily Total: <span className="font-semibold text-green-600">{formatINR(dailyTotal)}</span>
                </div>
                <div className="text-xs text-gray-600">
                  In words: <span className="font-medium">{numberToIndianWords(dailyTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sticky bottom total/action bar for mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
        <div className="mx-auto px-4 py-3 md:px-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-600">Daily Total Revenue</div>
            <div className="text-lg font-bold leading-none text-green-600">{formatINR(dailyTotal)}</div>
            <div className="text-[10px] text-gray-500 mt-1 line-clamp-1" title={numberToIndianWords(dailyTotal)}>
              {numberToIndianWords(dailyTotal)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={addRow} className="h-9 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
            <Button onClick={addSamplePatients} variant="outline" className="h-9 bg-purple-50 hover:bg-purple-100 border-purple-200">
              <Plus className="h-4 w-4 mr-1.5 text-purple-600" />
              Sample
            </Button>
            <Button variant="outline" onClick={exportCSV} className="h-9">
              <Download className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportExcel} className="h-9 bg-green-50 hover:bg-green-100 border-green-200">
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-green-600" />
              Excel
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}