"use client";

import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as xlsx from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
  data: any[];
  filename: string;
  title: string;
}

export function ExportButtons({ data, filename, title }: ExportButtonsProps) {
  const exportToExcel = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      
      // Generate Excel file
      xlsx.writeFile(workbook, `${filename}_${new Date().getTime()}.xlsx`);
      toast.success("Berhasil mengekspor ke Excel");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengekspor ke Excel");
    }
  };

  const exportToPDF = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }

      const doc = new jsPDF("landscape");
      
      // Title
      doc.setFontSize(16);
      doc.text(title, 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      // Extract headers from the first object
      const firstObj = data[0];
      const headers = Object.keys(firstObj).filter(key => typeof firstObj[key] !== 'object' && typeof firstObj[key] !== 'function');

      // Map data to rows
      const rows = data.map((item) => 
        headers.map((header) => {
          const val = item[header];
          if (val === null || val === undefined) return "-";
          if (typeof val === 'boolean') return val ? "Ya" : "Tidak";
          return String(val);
        })
      );

      // Draw table
      autoTable(doc, {
        head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/_/g, ' '))],
        body: rows,
        startY: 28,
        theme: "grid",
        headStyles: { fillColor: [249, 115, 22] }, // Orange theme to match Lucky Land
        styles: { fontSize: 8 },
      });

      doc.save(`${filename}_${new Date().getTime()}.pdf`);
      toast.success("Berhasil mengekspor ke PDF");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengekspor ke PDF");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline-block">Export</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-red-500" />
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Export to Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
