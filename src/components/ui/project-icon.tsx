import { IconRenderer } from "./icon-picker";
import { Project } from "@/lib/api/projects";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface ProjectIconProps {
  project?: Project | null;
  className?: string;
  iconClassName?: string;
  showTooltip?: boolean;
}

export const ProjectIcon = ({ project, className = "w-5 h-5", iconClassName = "h-3 w-3", showTooltip = true }: ProjectIconProps) => {
  if (!project || !project.tags || project.tags.length === 0) return null;

  const tag = project.tags[0];
  

  const IconElement = (
    <div
      className={`rounded-md flex items-center justify-center shrink-0 shadow-sm ${showTooltip ? 'cursor-help transition-transform hover:scale-110' : ''} ${className}`}
      style={{ color: tag.color || '#6b7280', backgroundColor: `${tag.color || '#6b7280'}18` }}
    >
      <IconRenderer icon={tag.icon || 'TagIcon'} className={iconClassName} />
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {IconElement}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs font-medium">
            {tag.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return IconElement;
};
