'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Select } from '@aletheia/ui';
import type {
  CreateScheduleSlotDto,
  DayOfWeek,
  LearnerSummaryDto,
  ScheduleSlotResponseDto,
  SubjectResponseDto,
  UpdateScheduleSlotDto,
} from '@aletheia/contracts';

export interface RoutineSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateScheduleSlotDto) => Promise<void>;
  onUpdate?: ((slotId: string, dto: UpdateScheduleSlotDto) => Promise<void>) | undefined;
  learners: LearnerSummaryDto[];
  subjects: SubjectResponseDto[];
  initialDayOfWeek?: DayOfWeek;
  academicYearId?: string;
  slotToEdit?: ScheduleSlotResponseDto | null | undefined;
}

export const DAYS_OF_WEEK: Array<{ value: DayOfWeek; label: string }> = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export function RoutineSlotModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  learners,
  subjects,
  initialDayOfWeek = 1,
  academicYearId,
  slotToEdit,
}: RoutineSlotModalProps) {
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(initialDayOfWeek);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [subjectId, setSubjectId] = useState('');
  const [learnerId, setLearnerId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slotToEdit) {
      setTitle(slotToEdit.title);
      setDayOfWeek(slotToEdit.dayOfWeek);
      setStartTime(slotToEdit.startTime);
      setEndTime(slotToEdit.endTime);
      setSubjectId(slotToEdit.subjectId || '');
      setLearnerId(slotToEdit.learnerId || '');
      setLocation(slotToEdit.location || '');
      setDescription(slotToEdit.description || '');
      setColor(slotToEdit.color || '#3B82F6');
    } else {
      setTitle('');
      setDayOfWeek(initialDayOfWeek);
      setStartTime('08:00');
      setEndTime('09:00');
      setSubjectId('');
      setLearnerId('');
      setLocation('');
      setDescription('');
      setColor('#3B82F6');
    }
    setError(null);
  }, [slotToEdit, initialDayOfWeek, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título do bloco de rotina.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Por favor, informe os horários de início e término.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const dto = {
        title: title.trim(),
        dayOfWeek: Number(dayOfWeek) as DayOfWeek,
        startTime,
        endTime,
        subjectId: subjectId || undefined,
        learnerId: learnerId || undefined,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        color: color || undefined,
        academicYearId: academicYearId || undefined,
      };
      if (slotToEdit && onUpdate) {
        await onUpdate(slotToEdit.id, dto);
      } else {
        await onSave(dto);
      }
      setTitle('');
      setDescription('');
      setLocation('');
      setSubjectId('');
      setLearnerId('');
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `Erro ao ${slotToEdit ? 'atualizar' : 'criar'} bloco de rotina`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={slotToEdit ? 'Editar Bloco de Rotina Semanal' : 'Novo Bloco de Rotina Semanal'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form="routine-slot-form" data-testid="save-slot-btn" isLoading={loading}>
            {slotToEdit ? 'Salvar Alterações' : 'Salvar Bloco'}
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="error" data-testid="slot-form-error" style={{ marginBottom: '1rem' }}>
          {error}
        </Alert>
      )}

      <form id="routine-slot-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Título da Atividade / Bloco *"
          data-testid="slot-title-input"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Devocional Matinal, Leitura Clássica, Matemática"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Dia da Semana *"
            data-testid="slot-day-select"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
            options={DAYS_OF_WEEK.map((d) => ({ value: String(d.value), label: d.label }))}
          />

          <Input
            label="Cor de Destaque"
            type="color"
            data-testid="slot-color-input"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Horário Início *"
            type="time"
            data-testid="slot-start-time-input"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Horário Término *"
            type="time"
            data-testid="slot-end-time-input"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Disciplina (Opcional)"
            data-testid="slot-subject-select"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={[
              { value: '', label: 'Nenhuma / Geral' },
              ...subjects.map((sub) => ({ value: sub.id, label: sub.name })),
            ]}
          />

          <Select
            label="Educando (Opcional)"
            data-testid="slot-learner-select"
            value={learnerId}
            onChange={(e) => setLearnerId(e.target.value)}
            options={[
              { value: '', label: 'Toda a Família' },
              ...learners.map((l) => ({ value: l.id, label: l.preferredName || l.firstName })),
            ]}
          />
        </div>

        <Input
          label="Local / Espaço (Opcional)"
          data-testid="slot-location-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex: Sala de Leitura, Mesa de Estudos, Ar Livre"
        />
      </form>
    </Modal>
  );
}
