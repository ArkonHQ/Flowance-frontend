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
  if (!project) return null;

  const hasTag = project.tags && project.tags.length > 0;
  const tag = hasTag ? project.tags![0] : null;

  const IconElement = hasTag ? (
    <span
      className={`rounded-md flex items-center justify-center shrink-0 shadow-sm ${showTooltip ? 'cursor-help transition-transform hover:scale-110' : ''} ${className}`}
      style={{ color: '#ffffff', backgroundColor: tag!.color || '#6b7280' }}
    >
      <IconRenderer icon={tag!.icon || 'TagIcon'} className={iconClassName} />
    </span>
  ) : (
    <span
      className={`rounded-md flex items-center justify-center shrink-0 shadow-sm bg-primary text-primary-foreground ${showTooltip ? 'cursor-help transition-transform hover:scale-110' : ''} ${className}`}
    >
      <span className="font-semibold text-[0.65em] uppercase leading-none">
        {(() => {
          const title = project.title || 'P';
          const words = title.trim().split(/\s+/);
          return words.length >= 2 
            ? (words[0][0] + words[1][0])
            : title.substring(0, 2);
        })()}
      </span>
    </span>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {IconElement}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs font-medium">
            {hasTag ? tag!.name : project.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return IconElement;
};
