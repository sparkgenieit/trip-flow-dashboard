'use client';
import React, { useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { DriverFormData } from './DriverTabs';

type Review = { id: string; rating: number; description: string; createdAt: string };

export default function DriverFeedbackReview(props: {
  value: DriverFormData;
  onChange: (patch: Partial<DriverFormData>) => void;
}) {
  const { value: v, onChange } = props;

  // Ensure local controlled values (fall back to remarks if feedback isn't present)
  const [rating, setRating] = useState<number>(v.rating ?? 0);
  const [hover, setHover] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(v.feedback ?? v.remarks ?? '');

  const reviews: Review[] = useMemo(
    () => (v.reviews as Review[]) ?? [],
    [v.reviews]
  );

  // ---- helpers --------------------------------------------------------------
  const saveCurrent = () => {
    if (!feedback.trim() || !rating) return;

    const newReview: Review = {
      id: Math.random().toString(36).slice(2),
      rating,
      description: feedback.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [newReview, ...reviews];
    onChange({ reviews: next, rating, feedback: '' });
    setFeedback('');
  };

  const removeReview = (id: string) => {
    const next = reviews.filter(r => r.id !== id);
    onChange({ reviews: next });
  };

  const copyReviews = async () => {
    const txt = reviews.map(r =>
      `Rating: ${r.rating} | ${r.description} | ${new Date(r.createdAt).toLocaleString()}`
    ).join('\n');
    try { await navigator.clipboard.writeText(txt); } catch {}
  };

  const downloadCSV = (filename: string) => {
    const header = ['S.NO', 'RATING', 'DESCRIPTION', 'CREATED ON'];
    const rows = reviews.map((r, i) => [
      String(i + 1),
      String(r.rating),
      `"${(r.description || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleString(),
    ]);
    const csv = [header, ...rows].map(a => a.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // table UI state
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');

  const filtered = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase();
    return reviews.filter(r =>
      r.description.toLowerCase().includes(q) ||
      String(r.rating).includes(q) ||
      new Date(r.createdAt).toLocaleString().toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const start = (pageSafe - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  // whenever dataset/pageSize changes, keep page in range
  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  // keep outer form synced when rating changes
  React.useEffect(() => {
    if (v.rating !== rating) onChange({ rating });
  }, [rating]); // eslint-disable-line

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* LEFT: Rating + Feedback */}
      <div className="rounded-md border p-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">Rating</Label>

          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const val = i + 1;
              const filled = (hover || rating) >= val;
              return (
                <button
                  type="button"
                  key={val}
                  onMouseEnter={() => setHover(val)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(val)}
                  aria-label={`Rate ${val}`}
                >
                  <Star
                    className={filled ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}
                    fill={filled ? 'currentColor' : 'none'}
                    size={22}
                  />
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            All reviews are from genuine customers
          </p>

          <div className="space-y-2 mt-2">
            <Label>Feedback *</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder=""
              rows={5}
            />
          </div>

          <div className="pt-2">
            <Button onClick={saveCurrent}>Save</Button>
          </div>
        </div>
      </div>

      {/* RIGHT: List of Reviews */}
      <div className="rounded-md border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">List of Reviews</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyReviews}>Copy</Button>
            <Button variant="outline" size="sm" onClick={() => downloadCSV('reviews_excel.csv')}>Excel</Button>
            <Button variant="outline" size="sm" onClick={() => downloadCSV('reviews.csv')}>CSV</Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show</span>
            <select
              className="h-8 rounded-md border px-2 text-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-sm">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Search:</span>
            <Input
              className="h-8 w-48"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2">S.NO</th>
                <th className="px-3 py-2">RATING</th>
                <th className="px-3 py-2">DESCRIPTION</th>
                <th className="px-3 py-2">CREATED ON</th>
                <th className="px-3 py-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    No data available in table
                  </td>
                </tr>
              )}
              {visible.map((r, i) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{start + i + 1}</td>
                  <td className="px-3 py-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                  <td className="px-3 py-2">{r.description}</td>
                  <td className="px-3 py-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeReview(r.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageSafe <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pageSafe >= pageCount}
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
