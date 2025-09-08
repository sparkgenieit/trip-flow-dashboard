'use client';
import React, { useMemo, useState } from "react";
import { DOC_TYPES, DocType, UploadedDoc } from "./types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function isImageFile(f?: File | null) {
  return !!f && /^image\//i.test(f.type);
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (doc: UploadedDoc) => void;
};

export default function UploadDialog({ open, onOpenChange, onAdd }: Props) {
  const [pendingType, setPendingType] = useState<DocType | "">("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const preview = useMemo(
    () => (isImageFile(pendingFile) ? URL.createObjectURL(pendingFile!) : ""),
    [pendingFile]
  );

  function handleAdd() {
    if (!pendingType || !pendingFile) return;
    onAdd({
      id: crypto.randomUUID(),
      type: pendingType as DocType,
      file: pendingFile,
      previewUrl: isImageFile(pendingFile) ? preview : undefined,
    });
    setPendingType("");
    setPendingFile(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Document Upload</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type *</Label>
            <Select value={pendingType} onValueChange={(v) => setPendingType(v as DocType)}>
              <SelectTrigger><SelectValue placeholder="Choose Type" /></SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Choose File *</Label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-white"
            />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="preview" className="max-h-40 rounded-md border" />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={!pendingType || !pendingFile}>
            Add file
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
