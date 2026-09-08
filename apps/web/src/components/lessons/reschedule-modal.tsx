'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Textarea } from '@aletheia/ui';
import type { RescheduleLessonDto } from '@aletheia/contracts';

export interface RescheduleLessonItem {
  id: string;
  title: string;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
}

export interface RescheduleModalProps {
  isOpen: boolean;
  lesson: RescheduleLessonItem | null;
  onClose: () => void;
  onReschedule: (lessonId: string, dto: RescheduleLessonDto) => Promise<void>;
}

export function RescheduleModal({
  isOpen,
  lesson,
  onClose,
  onReschedule,
}: RescheduleModalProps) {
  const [newDate, setNewDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson) {
      setNewDate(lesson.date || new Date().toISOString().split('T')[0] || '');
      setStartTime(lesson.startTime || '09:00');
      setEndTime(lesson.endTime || '10:00');
      setReason('');
      setError(null);
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      setError('Por favor, informe a nova data.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onReschedule(lesson.id, {
        newDate,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        reason: reason.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao reagendar lição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reagendar Lição"
      description={
        <>
          Lição: <strong>{lesson.title}</strong>
        </>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="reschedule-form" data-testid="save-reschedule-btn" isLoading={loading}>
            Confirmar Reagendamento
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="error" data-testid="reschedule-error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <form id="reschedule-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Nova Data *"
          type="date"
          data-testid="reschedule-date-input"
          required
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Início"
            type="time"
            data-testid="reschedule-start-time-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Término"
            type="time"
            data-testid="reschedule-end-time-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <Textarea
          label="Motivo / Observação"
          rows={2}
          data-testid="reschedule-reason-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex: Passeio ao museu, reagendado para o período da tarde..."
        />
      </form>
    </Modal>
  );
}
