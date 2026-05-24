'use client'

import DeleteButton from "@/app/(projects)/components/DeleteProject"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Project } from "@/lib/api/projects"
import { Building, Calendar, FileText } from "lucide-react"
import Link from "next/link"





const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-700 border-gray-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    on_hold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[status] || colors.planning
}


interface Props {
  project: Project
}

export const ProjectDetail = ({ project }: Props) => {

  const statusDisplay = project.status.replace('_', ' ')


  return (
  <div className="relative overflow-hidden border border-border/30 bg-card/50 shadow-sm backdrop-blur-md rounded-xl">
    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-blue-500" />
    
    <CardHeader className="pt-5 flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl font-bold">
            {project.title}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={'outline'} className={getStatusColor(project.status)}>
              {statusDisplay}
            </Badge>
            {project.client && (
              <Link href={`/clients/${project.client.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-all">
                <Building className="h-3.5 w-3.5" />
                {project.client.name}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant={'outline'} size={'sm'} >
                Edit
              </Button>
            </Link>
            <DeleteButton projectId={project.id} projectName={project.title} />
          </div>
        </div>

      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Updated: {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
  </div>
  )
}