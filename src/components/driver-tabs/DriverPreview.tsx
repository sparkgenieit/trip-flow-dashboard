'use client';
import React, { useMemo } from 'react';
import type { DriverFormData } from './DriverTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value ?? '--'}</div>
    </div>
  );
}

export default function DriverPreview({ value: v }: { value: DriverFormData }) {
  // Build document tiles from new array model or legacy single-file fields
  const docTiles = useMemo(() => {
    type Tile = { id: string; label: string; src?: string };
    const tiles: Tile[] = [];

    const addFile = (id: string, label: string, file: File | null | undefined) => {
      if (!file) return;
      const isImage = /^image\//.test(file.type);
      tiles.push({ id, label, src: isImage ? URL.createObjectURL(file) : undefined });
    };

    const fromArray = (v as any).documents as
      | { id: string; type: 'Aadhar Card' | 'PAN Card' | 'Voter ID' | 'License Card'; file?: File | null }[]
      | undefined;

    if (fromArray?.length) {
      fromArray.forEach((d) => addFile(d.id, d.type, d.file ?? null));
    } else {
      addFile('pan', 'PAN Card', v.docPan ?? null);
      addFile('aadhar', 'Aadhar Card', v.docAadhar ?? null);
      addFile('license', 'License Card', v.docLicense ?? null);
      addFile('voter', 'Voter ID', v.docAddressProof ?? null);
    }

    return tiles;
  }, [v]);

  const licenseHistory =
    (v as any).licenseHistory as { id: string; licenseNumber: string; startDate: string; endDate: string }[] | undefined;

  const reviews =
    (v as any).reviews as { id: string; rating: number; description: string; createdAt: string }[] | undefined;

  return (
    <div className="space-y-6">
      {/* BASIC INFO */}
      <Card>
        <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <Field label="Vendor Name" value={v.vendorName ?? v.vendorId ?? '--'} />
          <Field label="Vehicle Type" value={v.vehicleType || 'No Vehicle Found !!!'} />
          <Field label="Driver Name" value={v.name || '--'} />
          <Field label="Date Of Birth" value={v.dob || '--'} />

          <Field label="Blood Group" value={v.bloodGroup || '--'} />
          <Field label="Gender" value={v.gender || '--'} />
          <Field label="Primary Mobile Number" value={v.primaryMobile || '--'} />
          <Field label="Aadhar Card Number" value={v.aadhar || '--'} />

          <Field label="Voter ID Number" value={v.voterId || '--'} />
          <Field label="License Number" value={v.licenseNumber || '--'} />
          <Field label="License Issue Date" value={v.licenseIssueDate || '--'} />
          <Field label="License Expire Date" value={v.licenseExpiryDate || '--'} />

          <div className="md:col-span-4">
            <Field label="Address" value={v.address || '--'} />
          </div>
        </CardContent>
      </Card>

      {/* COST DETAILS */}
      <Card>
        <CardHeader><CardTitle>Cost Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Field label="Driver Salary (₹)" value={v.driverSalary ?? '--'} />
          <Field label="Early Morning Charges(₹) (Before 6 AM)" value={v.earlyMorningCharges ?? '--'} />
          <Field label="Evening Charges(₹) (After 6 PM)" value={v.eveningCharges ?? '--'} />
        </CardContent>
      </Card>

      {/* DOCUMENT UPLOAD */}
      <Card>
        <CardHeader><CardTitle>Document Upload</CardTitle></CardHeader>
        <CardContent>
          {docTiles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No documents uploaded.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {docTiles.map((d) => (
                <div key={d.id} className="space-y-2">
                  <div className="text-sm">{d.label}</div>
                  <div className="w-56 h-32 border rounded-md overflow-hidden bg-muted/20 flex items-center justify-center">
                    {d.src ? (
                      // show image preview if available
                      <img src={d.src} alt={d.label} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-muted-foreground">File uploaded</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RENEWAL HISTORY */}
      <Card>
        <CardHeader><CardTitle>Renewal History</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2">S.NO</th>
                <th className="px-3 py-2">LICENSE NUMBER</th>
                <th className="px-3 py-2">VALIDITY START DATE</th>
                <th className="px-3 py-2">VALIDITY END DATE</th>
                <th className="px-3 py-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {!licenseHistory?.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No License History Found !!!
                  </td>
                </tr>
              )}
              {licenseHistory?.map((h, i) => (
                <tr key={h.id} className="border-t">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{h.licenseNumber}</td>
                  <td className="px-3 py-2">{h.startDate}</td>
                  <td className="px-3 py-2">{h.endDate}</td>
                  <td className="px-3 py-2">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* FEEDBACK & REVIEW */}
      <Card>
        <CardHeader><CardTitle>Feedback & Review</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2">S.NO</th>
                <th className="px-3 py-2">RATING</th>
                <th className="px-3 py-2">DESCRIPTION</th>
                <th className="px-3 py-2">CREATED ON</th>
              </tr>
            </thead>
            <tbody>
              {!reviews?.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    No Reviews Found !!!
                  </td>
                </tr>
              )}
              {reviews?.map((r, i) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{r.rating}</td>
                  <td className="px-3 py-2">{r.description}</td>
                  <td className="px-3 py-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
