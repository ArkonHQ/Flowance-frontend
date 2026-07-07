"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Home,
    Users,
    FolderKanban,
    CheckSquare,
    DollarSign,
    FileText,
    Command,
    User,
    LogOut,
    Moon,
    Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GlobalTimerDisplay } from "@/components/GlobalTimerDisplay";
import { PinnedProjectsDisplay } from "@/components/PinnedProjectsDisplay";
import { TeamSwitcher } from "./team-switcher";
import { Invitations } from "./invitations";



const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Clients", url: "/clients", icon: Users },
    { title: "Projects", url: "/projects", icon: FolderKanban },
    { title: "Tasks", url: "/tasks", icon: CheckSquare },
    { title: "Invoices", url: "/invoices", icon: DollarSign },
    { title: "Reports", url: "/reports", icon: FileText },
];

const AppSidebar = () => {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { open } = useSidebar();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        className="text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/60 hover:text-foreground data-[active=true]:bg-secondary data-[active=true]:text-foreground data-[active=true]:font-semibold"
                                    >
                                        <Link href={item.url} className="flex items-center gap-2.5">
                                            <item.icon className="h-4 w-4" />
                                            {open && <span>{item.title}</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Pinned projects global, it reads from Zustand store directly */}
                <div className="mt-auto flex flex-col gap-0">
                    <PinnedProjectsDisplay />
                    <GlobalTimerDisplay />
                </div>
            </SidebarContent>

            {/* Footer with user & theme toggle */}

            <SidebarFooter className="border-sidebar-border/30 border-t p-3">
                <div className="flex items-center justify-between">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <User className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Your Profile</TooltipContent>
                    </Tooltip>
                    {open &&
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle theme</TooltipContent>
                    </Tooltip>
                    }{open &&
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sign out</TooltipContent>
                    </Tooltip>
                }
                </div>
            </SidebarFooter>

        </Sidebar>
    );
};

export default AppSidebar;