'use client';
import React, { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { DriverFormData } from './DriverTabs';

type DocType = 'Aadhar Card' | 'PAN Card' | 'Voter ID' | 'License Card';
type DriverDoc = { id: string; type: DocType; file?: File | null; name?: string; url?: string };

const DOC_TYPES: DocType[] = ['Aadhar Card', 'PAN Card', 'Voter ID', 'License Card'];

export default function DriverDocumentsForm(props: {
  value: DriverFormData;
  onChange: (patch: Partial<DriverFormData>) => void;
}) {
  const { value: v, onChange } = props;

  // derive tiles from either v.documents or legacy single-file fields
  const derivedFromLegacy = useMemo<DriverDoc[]>(() => {
    const arr: DriverDoc[] = [];
    if (v.docAadhar)  arr.push({ id: 'aadhar',  type: 'Aadhar Card',  file: v.docAadhar,  name: v.docAadhar.name });
    if (v.docPan)     arr.push({ id: 'pan',     type: 'PAN Card',     file: v.docPan,     name: v.docPan.name });
    if (v.docLicense) arr.push({ id: 'license', type: 'License Card', file: v.docLicense, name: v.docLicense.name });
    if (v.docAddressProof) arr.push({ id: 'voter', type: 'Voter ID', file: v.docAddressProof, name: v.docAddressProof.name });
    return arr;
  }, [v.docAadhar, v.docPan, v.docLicense, v.docAddressProof]);

  const documents: DriverDoc[] = (v as any).documents?.length ? (v as any).documents : derivedFromLegacy;

  // modal state
  const [open, setOpen] = useState(false);
  const [docType, setDocType] = useState<DocType | ''>('');
  const [file, setFile] = useState<File | null>(null);

  const applyPatch = (docs: DriverDoc[], extra?: Partial<DriverFormData>) => {
    onChange({
      ...(extra ?? {}),
      // keep new array model under `documents`
      documents: docs,
    });
  };

  const handleSave = () => {
    if (!docType || !file) return;
    const id = Math.random().toString(36).slice(2);
    const next = [...documents.filter(d => d.type !== docType), { id, type: docType, file, name: file.name }];

    // also mirror into legacy fields so nothing breaks elsewhere
    const mirror: Partial<DriverFormData> = {};
    if (docType === 'Aadhar Card')  mirror.docAadhar = file;
    if (docType === 'PAN Card')     mirror.docPan = file;
    if (docType === 'License Card') mirror.docLicense = file;
    if (docType === 'Voter ID')     mirror.docAddressProof = file;

    applyPatch(next, mirror);
    // reset modal fields
    setDocType('');
    setFile(null);
    setOpen(false);
  };

  const removeDoc = (d: DriverDoc) => {
    const next = documents.filter(x => x.id !== d.id && x.type !== d.type);

    const mirror: Partial<DriverFormData> = {};
    if (d.type === 'Aadhar Card')  mirror.docAadhar = null as any;
    if (d.type === 'PAN Card')     mirror.docPan = null as any;
    if (d.type === 'License Card') mirror.docLicense = null as any;
    if (d.type === 'Voter ID')     mirror.docAddressProof = null as any;

    applyPatch(next, mirror);
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Upload Documents</Label>
        <Button onClick={() => setOpen(true)}>+ Upload</Button>
      </div>

      {/* Dashed area like screenshot */}
      <div className="border border-dashed rounded-md p-4">
        {documents.length === 0 ? (
          <div className="text-sm text-muted-foreground">No documents uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((d) => (
              <div key={d.id} className="relative flex items-center justify-between rounded-md border p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md border flex items-center justify-center text-xs">📁</div>
                  <div className="text-sm font-medium">{d.type}</div>
                </div>
                <button
                  type="button"
                  aria-label="Remove"
                  className="rounded-full w-6 h-6 flex items-center justify-center border hover:bg-muted"
                  onClick={() => removeDoc(d)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Upload</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Document Type *</Label>
              <Select value={docType} onValueChange={(v) => setDocType(v as DocType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Document *</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={handleSave} disabled={!docType || !file}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
