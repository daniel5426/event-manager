'use client';

import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import { exportParticipants } from '../actions';

export function ExportButton({ eventId }: { eventId: number }) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 gap-1"
      onClick={async () => {
        const response = await exportParticipants(eventId);
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participants-${eventId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      }}
    >
      <File className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        ייצוא לאקסל
      </span>
    </Button>
  );
} 