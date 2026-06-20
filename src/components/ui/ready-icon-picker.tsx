"use client";
import { useState } from "react";
import { IconRenderer, useIconPicker } from "./icon-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const IconPickerDialog = ({
  value,
  onChange,
  disabled
}: {
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-10 h-8 p-0 shrink-0 shadow-sm transition-transform hover:scale-105" disabled={disabled} title="Pick an Icon">
          {value ? (
            <IconRenderer className="size-4" icon={value} />
          ) : (
            <IconRenderer className="size-4" icon="TagIcon" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl shadow-xl rounded-2xl border-muted/60">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>Choose an icon for your tag</DialogDescription>
        </DialogHeader>
        <IconPicker
          onChange={(icon) => {
            onChange(icon);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
export const IconPicker = ({
  onChange,
}: {
  onChange: (icon: string) => void;
}) => {
  const { search, setSearch, icons } = useIconPicker();

  return (
    <div className="relative">
      <Input
        placeholder="Search..."
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="mt-2 flex h-full max-h-[400px] flex-wrap gap-2 overflow-y-scroll py-4 pb-12">
        {icons.map(({ name, Component }) => (
          <Button
            key={name}
            type="button"
            role="button"
            onClick={() => onChange(name)}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl border border-black/5 hover:border-primary/50 hover:bg-primary/5 hover:scale-110 transition-all shadow-sm"
          >
            <Component className="!size-6 shrink-0 text-muted-foreground hover:text-primary transition-colors" />
            <span className="sr-only">{name}</span>
          </Button>
        ))}
        {icons.length === 0 && (
          <div className="col-span-full flex grow flex-col items-center justify-center gap-2 text-center">
            <p>No icons found...</p>
            <Button onClick={() => setSearch("")} variant="ghost">
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};