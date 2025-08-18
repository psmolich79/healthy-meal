import React, { useState } from "react";
import type { DailyUsageDto } from "@/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface DailyBreakdownProps {
  data: DailyUsageDto[];
  onSort: (column: string, direction: "asc" | "desc") => void;
  className?: string;
}

const DailyBreakdown: React.FC<DailyBreakdownProps> = ({ data, onSort, className }) => {
  const [sortColumn, setSortColumn] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sorted = [...data].sort((a, b) => {
    let comp = 0;
    if (sortColumn === "date") comp = a.date.localeCompare(b.date);
    if (sortColumn === "generations") comp = a.generations - b.generations;
    if (sortColumn === "cost") comp = (a.cost ?? 0) - (b.cost ?? 0);
    return sortDirection === "asc" ? comp : -comp;
  });

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(direction);
    onSort(column, direction);
  };

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort("date")}>Data</TableHead>
          <TableHead onClick={() => handleSort("generations")}>Generacje</TableHead>
          <TableHead onClick={() => handleSort("cost")}>Koszt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row, idx) => (
          <TableRow key={idx}>
            <TableCell>{row.date}</TableCell>
            <TableCell>{row.generations}</TableCell>
            <TableCell>{row.cost ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DailyBreakdown;
