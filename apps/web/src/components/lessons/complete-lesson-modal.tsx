'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Textarea } from '@aletheia/ui';
import type { CompleteLessonDto } from '@aletheia/contracts';

export interface CompleteLessonItem {
  id: string;
  title: string;
  durationMinutes?: number | null;
  learners?: Array<{ learnerId: string; learnerName?: string; id?: string }>;
}

export interface CompleteLessonModalProps {
  isOpen: boolean;
  lesson: CompleteLessonItem | null;
  onClose: () => void;
  onComplete: (lessonId: string, dto: CompleteLessonDto, learnerId?: string) => Promise<void>;
}

export function CompleteLessonModal({
  isOpen,
  lesson,
  onClose,
  onComplete,
}: CompleteLessonModalProps) {
  const [actualDurationMinutes, setActualDurationMinutes] = useState<number>(45);
  const [notes, setNotes] = useState('');
  const [learnerNotes, setLearnerNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson) {
      setActualDurationMinutes(lesson.durationMinutes || 45);
      setNotes('');
      setLearnerNotes({});
      setError(null);
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleLearnerNoteChange = (learnerId: string, value: string) => {
    setLearnerNotes((prev) => ({ ...prev, [learnerId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onComplete(lesson.id, {
        completedAt: new Date().toISOString(),
        actualDurationMinutes: actualDurationMinutes ? Number(actualDurationMinutes) : undefined,
        notes: notes.trim() || undefined,
        learnerNotes: Object.keys(learnerNotes).length > 0 ? learnerNotes : undefined,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao concluir lição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concluir Lição"
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
          <Button type="submit" form="complete-lesson-form" data-testid="confirm-complete-btn" isLoading={loading}>
            Concluir Lição
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="error" data-testid="complete-error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <form id="complete-lesson-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Tempo Real de Execução (minutos)"
          type="number"
          data-testid="actual-duration-input"
          min={1}
          max={1440}
          value={actualDurationMinutes}
          onChange={(e) => setActualDurationMinutes(Number(e.target.value))}
        />

        <Textarea
          label="Notas de Avaliação e Desempenho Geral"
          rows={3}
          data-testid="complete-notes-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Como foi a compreensão do tema, engajamento e retenção..."
        />

        {lesson.learners && lesson.learners.length > 1 && (
          <div>
            <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Observações Individuais por Educando (Opcional)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lesson.learners.map((l) => (
                <Input
                  key={l.learnerId}
                  label={l.learnerName || 'Educando'}
                  data-testid={`learner-note-input-${l.learnerId}`}
                  value={learnerNotes[l.learnerId] || ''}
                  onChange={(e) => handleLearnerNoteChange(l.learnerId, e.target.value)}
                  placeholder="Feedback específico..."
                />
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
