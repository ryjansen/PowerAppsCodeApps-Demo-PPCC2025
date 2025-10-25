import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alaug_projectsService } from "@/generated"
import type { Alaug_projects } from "@/generated/models/Alaug_projectsModel"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { ArrowDown, ArrowUp, FolderKanban } from "lucide-react"
import { useState } from "react"

function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("START: Alaug_projectsService.getAll");

      const res = await Alaug_projectsService.getAll({
        select: [
          "alaug_projectid",
          "alaug_name",
          "alaug_description",
          "alaug_state",
          "alaug_startdate",
          "alaug_enddate",
          "alaug_owner",
        ],
        orderBy: ["alaug_name asc"],
        top: 200,
      })

      console.log("END: Alaug_projectsService.getAll");
      console.log("RESULT", res);
      
      return res.data
    },
    initialData: [],
    initialDataUpdatedAt: 0
  })
}

export default function DashboardPage() {
  const { data, isLoading, isError, error} = useProjects();

  let content = "";
  if (isLoading) {
    content = "Loading";
  } else if (isError) {
    content = `Error: ${error}`;
  } else {
    content = JSON.stringify(data, null, 2);
  }

  return (
    <div>
      <Header />

      {/* 1 - Empty */}
      <Card className="my-4">
        <CardContent>
          <h1 className="text-2xl">TODO: Build the app</h1>
        </CardContent>
      </Card>

      {/* 2 - JSON */}
      <Card className="my-4">
        <CardContent>
          <pre>{content}</pre>
        </CardContent>
      </Card>

      {/* 2 - Projects Table */}
      <Card className="my-4">
        <CardContent>
          <ProjectsTable />
        </CardContent>
      </Card>
    </div>
  )
}

/****************************************************************
 * HEADER
 ****************************************************************/
function Header() {
  return(
    <header className="flex items-center gap-4 my-8">
        {/* Icon tile */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                        bg-linear-to-br from-violet-500 to-fuchsia-500
                        text-white shadow-md">
          <FolderKanban className="h-7 w-7" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold leading-none tracking-tight">
          <span className="bg-linear-to-r from-fuchsia-500 to-violet-500
                          bg-clip-text text-transparent">
            Project Dashboard
          </span>
        </h1>
    </header>
  )
}
/****************************************************************
 * PROJECTS TABLE
 ****************************************************************/

const columns: ColumnDef<Alaug_projects>[] = [
  {
    accessorKey: "alaug_name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium leading-6">{row.getValue("alaug_name")}</div>
    ),
  },
  {
    accessorKey: "alaug_description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-sm whitespace-normal wrap-break-words leading-6 text-muted-foreground">{row.getValue("alaug_description")}</div>
    ),
  },
  {
    accessorKey: "alaug_state",
    header: "State",
    cell: ({ row }) => {
      let badgeClass = "";
      let value = row.getValue("alaug_state");
      
      switch (value) {
        case "Not Started":
          badgeClass = "bg-blue-100 text-blue-700";
          break;
        case "Started":
          badgeClass = "bg-gray-200 text-gray-700";
          break;
        case "In Progress":
          badgeClass = "bg-yellow-100 text-yellow-800";
          break;
        case "At Risk":
          badgeClass = "bg-red-100 text-red-700";
          break;
        case "Complete":
          badgeClass = "bg-green-100 text-green-700";
          break;
      }

      return (
        <Badge variant="secondary" className={cn(`${badgeClass}`, "px-2.5 py-0.5 rounded-full text-sm font-medium")}>{row.getValue("alaug_state")}</Badge>
      )
    },
  },
  {
    accessorKey: "alaug_startdate",
    header: "Start Date",
    cell: ({ row }) => {
      const startDate = new Date(row.getValue("alaug_startdate"));
      const startDateFormatted = formatDate(startDate, "M/dd/yyyy")

      return (
        <div>{startDateFormatted}</div>
      )
    },
  },
  {
    accessorKey: "alaug_enddate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = new Date(row.getValue("alaug_enddate"));
      const endDateFormatted = formatDate(endDate, "M/dd/yyyy")

      return (
        <div>{endDateFormatted}</div>
      )
    },
  },
];

function ProjectsTable() {
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { data, isLoading, isError } = useProjects();

  const table = useReactTable<Alaug_projects>({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isError) return <div>Error</div>;
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          autoComplete="off"
          placeholder="Filter"
          value={filter ?? ""}
          onChange={(event) => {
            setFilter(event.target.value);
            table.setGlobalFilter(event.target.value);
          }}
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                    {header.isPlaceholder
                      ? null
                      : (
                          <div className="flex items-center gap-1 justify-start">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="ml-2 flex items-center relative top-px text-muted-foreground">
                                {header.column.getIsSorted() === "asc" && (
                                  <ArrowUp className="h-3.5 w-3.5" />
                                )}
                                {header.column.getIsSorted() === "desc" && (
                                  <ArrowDown className="h-3.5 w-3.5" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="align-top whitespace-normal wrap-break-words p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}