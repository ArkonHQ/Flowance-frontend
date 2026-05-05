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
            {/* Header with logo */}
            <SidebarHeader className="flex flex-row items-center gap-2 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Command className="h-4 w-4 text-primary-foreground" />
                </div>
                {open && (
                    <span className="text-lg font-semibold tracking-tight text-sidebar-primary">
                        FreelanceHQ
                    </span>
                )}
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                    >
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4" />
                                            {open && <span>{item.title}</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with user & theme toggle */}
            <SidebarFooter className="border-t p-3">
                <div className="flex items-center justify-between">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <User className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Your Profile</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle theme</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sign out</TooltipContent>
                    </Tooltip>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;