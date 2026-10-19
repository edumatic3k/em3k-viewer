import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DynamicPage from './dynamicPage';

describe('quiz Answers step', () => {
  let container;

  afterEach(() => {
    act(() => render(null, container));
    container?.remove();
    container = null;
  });

  it('compares each submitted response with the correct answer and offers failed retries', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onStartQuizAgain = vi.fn();
    const step = {
      kind: 'quiz-results',
      lesson: { id: 'lesson-one', title: 'Lesson one' },
      quiz: {
        title: 'Practice',
        passPercent: 70,
        questions: [
          { id: 'q1', type: 'multiple-choice', prompt: 'Pick yes', answer: 'yes', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] },
          { id: 'q2', type: 'true-false', prompt: 'True?', answer: true },
        ],
      },
    };
    const attempt = {
      attemptId: 'attempt-one',
      answers: { q1: 'no', q2: false },
      correct: 0,
      total: 2,
      percent: 0,
      passed: false,
      submittedAt: '2026-01-01T00:00:00.000Z',
    };

    await act(() => render(h(DynamicPage, {
      course: { title: 'Course' },
      step,
      stepIndex: 2,
      quizAttempt: attempt,
      quizAttempts: [attempt],
      bestPassingScore: 0,
      onBack: vi.fn(),
      onNext: vi.fn(),
      onStartQuizAgain,
    }), container));

    expect(container.textContent).toContain('Not passed');
    expect(container.textContent).toContain('Your answer: No');
    expect(container.textContent).toContain('Correct answer: Yes');
    expect(container.textContent).toContain('Your answer: False');
    expect(container.textContent).toContain('Correct answer: True');
    await act(() => [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Try Again').click());
    expect(onStartQuizAgain).toHaveBeenCalledWith('lesson-one');
  });

  it('preserves score-only historical attempts without inventing responses', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const attempt = { attemptId: 'legacy-0', score: 1, total: 2, percent: 50, passed: false };
    const step = {
      kind: 'quiz-results',
      lesson: { id: 'lesson-one', title: 'Lesson one' },
      quiz: { title: 'Practice', passPercent: 70, questions: [{ id: 'q1', prompt: 'Pick yes', answer: 'yes', options: [{ id: 'yes', text: 'Yes' }] }] },
    };

    await act(() => render(h(DynamicPage, {
      course: { title: 'Course' },
      step,
      quizAttempt: attempt,
      quizAttempts: [attempt],
      onBack: vi.fn(),
      onNext: vi.fn(),
      onStartQuizAgain: vi.fn(),
    }), container));

    expect(container.textContent).toContain('Your answer: Not recorded');
    expect(container.textContent).toContain('Correct answer: Yes');
    expect(container.textContent).toContain('Submitted responses are not available for this historical attempt.');
  });

  it('does not reveal correct answers when outline navigation opens Answers before submission', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onStartQuizAgain = vi.fn();
    const step = {
      kind: 'quiz-results',
      lesson: { id: 'lesson-one', title: 'Lesson one' },
      quiz: {
        title: 'Practice',
        questions: [{ id: 'q1', prompt: 'Pick yes', answer: 'yes', options: [{ id: 'yes', text: 'Yes' }] }],
      },
    };

    await act(() => render(h(DynamicPage, {
      course: { title: 'Course' },
      step,
      onBack: vi.fn(),
      onNext: vi.fn(),
      onStartQuizAgain,
    }), container));

    expect(container.textContent).toContain('No submitted attempt yet.');
    expect(container.textContent).not.toContain('Correct answer:');
    await act(() => [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Start Quiz').click());
    expect(onStartQuizAgain).toHaveBeenCalledWith('lesson-one');
  });

  it('allows passed retakes only when the latest quiz policy enables them', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const attempt = { attemptId: 'attempt-two', answers: {}, correct: 1, total: 1, percent: 100, passed: false };
    const step = {
      kind: 'quiz-results',
      lesson: { id: 'lesson-one', title: 'Lesson one' },
      quiz: { title: 'Practice', questions: [] },
    };
    const props = {
      course: { title: 'Course' },
      step,
      quizAttempt: attempt,
      quizAttempts: [{ ...attempt, passed: true, percent: 90 }, attempt],
      onBack: vi.fn(),
      onNext: vi.fn(),
      onStartQuizAgain: vi.fn(),
    };

    await act(() => render(h(DynamicPage, props), container));
    expect(container.textContent).not.toContain('Try Again');
    expect(container.textContent).not.toContain('Retake Quiz');

    await act(() => render(h(DynamicPage, {
      ...props,
      step: { ...step, quiz: { ...step.quiz, allowRetakes: true } },
    }), container));
    expect(container.textContent).toContain('Retake Quiz');
  });
});