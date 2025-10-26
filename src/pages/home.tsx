import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Alaug_projectsService } from "@/generated"
import type { Alaug_projects } from "@/generated/models/Alaug_projectsModel"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
import { ArrowDown, ArrowUp, FolderKanban, Plus } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

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

function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectData: Partial<Omit<Alaug_projects, "alaug_projectid">>) => {
      return await Alaug_projectsService.create(
        projectData as Omit<Alaug_projects, "alaug_projectid">
      )
    },
    onSuccess: () => {
      // Invalidate project list to refetch
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}

export default function DashboardPage() {
  return (
    <div>
      <Header />

      {/* 1 - Empty */}
      {/* <Card className="my-4">
        <CardContent>
          <h1 className="text-2xl">TODO: Build the app</h1>
        </CardContent>
      </Card> */}

      {/* 2 - JSON */}
      {/* <Card className="my-4">
        <CardContent>
          <pre>{content}</pre>
        </CardContent>
      </Card> */}

      {/* 2 - Projects Table */}
      <Card className="my-4">
        <CardContent>
          <ProjectsTable />
        </CardContent>
      </Card>

      {/* 3 - Projects Chart */}
      <Card className="my-4">
        <CardHeader>
          <CardTitle>Projects by State</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectsChart />
        </CardContent>
      </Card>
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
          badgeClass = "bg-slate-100 text-slate-700";
          break;
        case "Started":
          badgeClass = "bg-indigo-100 text-indigo-700";
          break;
        case "In Progress":
          badgeClass = "bg-amber-100 text-amber-700";
          break;
        case "At Risk":
          badgeClass = "bg-rose-100 text-rose-700";
          break;
        case "Complete":
          badgeClass = "bg-emerald-100 text-emerald-700";
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

  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false)

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
      <div className="flex items-center justify-between gap-3 py-4">
        <Input
          autoComplete="off"
          placeholder="Filter"
          value={filter ?? ""}
          onChange={(e) => {
            setFilter(e.target.value)
            table.setGlobalFilter(e.target.value)
          }}
          className="max-w-sm"
        />
        <div className="flex justify-end">
          <Button className="bg-violet-500" onClick={() => setAddProjectDialogOpen(true)}>
          <Plus className="h-4 w-4 relative top-px" />
            Add Project
          </Button>
        </div>
      </div>

      <AddProjectDialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen} />

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

/****************************************************************
 * ADD PROJECT DIALOG
 ****************************************************************/

function AddProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  type ProjectState = "Not Started" | "Started" | "In Progress" | "At Risk" | "Complete"

  const createProject = useCreateProject();

  const [projectData, setProjectData] = useState<{
    name: string
    description: string
    owner: string
    state: ProjectState | ""
    startDate: string
    endDate: string
  }>({
    name: "",
    description: "",
    owner: "",
    state: "",
    startDate: "",
    endDate: "",
  })

  const handleChange = (field: string, value: string) =>
    setProjectData((p) => ({ ...p, [field]: value }))

  const handleSubmit = async () => {
    const dataverseProject: Partial<Omit<Alaug_projects, "alaug_projectid">> = {
      alaug_name: projectData.name,
      alaug_description: projectData.description,
      alaug_startdate: projectData.startDate
        ? new Date(projectData.startDate).toISOString()
        : undefined,
      alaug_enddate: projectData.endDate
        ? new Date(projectData.endDate).toISOString()
        : undefined,
      alaug_owner: projectData.owner,
      alaug_state: projectData.state as ProjectState,
    }

    try {
      await createProject.mutateAsync(dataverseProject)
      onOpenChange(false);
      setProjectData({ name: "", description: "", owner: "", state: "", startDate: "", endDate: "" });
      toast.success("Project created successfully!");
    } catch (err) {
      toast.error(`Error creating project: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>Enter details for the new project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter project name"
              value={projectData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project"
              value={projectData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              placeholder="Owner name"
              value={projectData.owner}
              onChange={(e) => handleChange("owner", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={projectData.state}
              onValueChange={(v) => handleChange("state", v)}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select project state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="Started">Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={projectData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={projectData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-violet-500" onClick={handleSubmit} disabled={createProject.isPending || !projectData.name}>
            {createProject.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/****************************************************************
 * PROJECTS CHART
 ****************************************************************/

const chartConfig = {
  "not-started":  { color: "#9ca3af" }, // slate-400 → neutral inactive
  "started":      { color: "#6366f1" }, // indigo-500 → active start (matches header tone)
  "in-progress":  { color: "#f59e0b" }, // amber-500 → warm progress
  "at-risk":      { color: "#f43f5e" }, // rose-500 → warning/red accent
  "complete":     { color: "#10b981" }, // emerald-500 → success
} satisfies ChartConfig;

const STATE_COLOR_MAP: Record<string, string> = {
  "Not Started": "var(--color-not-started)",
  "Started": "var(--color-started)",
  "In Progress": "var(--color-in-progress)",
  "At Risk": "var(--color-at-risk)",
  "Complete": "var(--color-complete)",
};

export function ProjectsChart() {
  const { data, isLoading, isError, error} = useProjects();

  if (isLoading) {
    return <div>Loading</div>;
  } else if (isError) {
    return <div>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }

  const chartData = data.reduce<{ state: string; count: number; fill: string }[]>(
    (acc, project) => {
      const state = project.alaug_state || "Not Started";
      const existing = acc.find((entry) => entry.state === state);

      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          state,
          count: 1,
          fill: STATE_COLOR_MAP[state] || "var(--color-not-started)",
        });
      }

      return acc;
    },
    []
  );

  console.log("Chart Data:", chartData);

  return (
    <ChartContainer config={chartConfig} className="h-[180px] min-h-[180px] w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="state" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={30} domain={[0, 'dataMax + 1']}allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent nameKey="state" />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}