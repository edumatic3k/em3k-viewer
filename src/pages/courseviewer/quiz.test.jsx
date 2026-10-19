import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Quiz from './quiz';

describe('practice quiz submissions', () => {
  let container;

  afterEach(() => {
    act(() => render(null, container));
    container?.remove();
    container = null;
  });

  it('shows the result only after persistence succeeds and records a retake as a new attempt', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onQuizResult = vi.fn();
    const quizData = {
      title: 'Practice',
      passPercent: 100,
      questions: [{
        id: 'question-one',
        prompt: 'Pick yes',
        answer: 'yes',
        options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }],
      }],
    };

    await act(() => render(h(Quiz, {
      quizData,
      lessonId: 'lesson-one',
      onQuizResult,
      onBack: vi.fn(),
      onNext: vi.fn(),
    }), container));
    await act(() => container.querySelector('input[value="yes"]').click());
    await act(() => container.querySelector('button[type="submit"]').click());
    await vi.waitFor(() => expect(container.textContent).toContain('Score: 1 of 1 (100%).'));

    expect(onQuizResult).toHaveBeenCalledWith('lesson-one', {
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    });

    await act(() => [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Try again')
      .click());
    await act(() => container.querySelector('input[value="no"]').click());
    await act(() => container.querySelector('button[type="submit"]').click());
    await vi.waitFor(() => expect(onQuizResult).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(container.textContent).toContain('Score: 0 of 1 (0%).'));
    expect(onQuizResult).toHaveBeenNthCalledWith(2, 'lesson-one', {
      correct: 0,
      total: 1,
      percent: 0,
      passed: false,
    });
  });

  it('keeps a failed result hidden and retries the same attempt after persistence fails', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onQuizResult = vi.fn()
      .mockRejectedValueOnce(new Error('IndexedDB unavailable'))
      .mockResolvedValueOnce(undefined);
    const quizData = {
      title: 'Practice',
      passPercent: 100,
      questions: [{
        id: 'question-one',
        prompt: 'Pick yes',
        answer: 'yes',
        options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }],
      }],
    };

    await act(() => render(h(Quiz, {
      quizData,
      lessonId: 'lesson-one',
      onQuizResult,
      onBack: vi.fn(),
      onNext: vi.fn(),
    }), container));
    await act(() => container.querySelector('input[value="yes"]').click());
    await act(() => container.querySelector('button[type="submit"]').click());
    await vi.waitFor(() => expect(container.textContent).toContain('Your result could not be saved.'));

    expect(container.textContent).not.toContain('Score:');
    expect(container.textContent).not.toContain('Correct');
    expect(container.querySelector('input[value="yes"]').checked).toBe(true);
    expect(onQuizResult).toHaveBeenCalledTimes(1);
    expect(onQuizResult).toHaveBeenNthCalledWith(1, 'lesson-one', {
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    });

    await act(() => container.querySelector('button[type="button"].btn-primary').click());
    await vi.waitFor(() => expect(container.textContent).toContain('Score: 1 of 1 (100%).'));
    expect(onQuizResult).toHaveBeenCalledTimes(2);
    expect(onQuizResult).toHaveBeenNthCalledWith(2, 'lesson-one', {
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    });
  });

  it('prevents duplicate persistence requests while a result is saving', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    let resolveSave;
    const onQuizResult = vi.fn(() => new Promise((resolve) => { resolveSave = resolve; }));
    const quizData = {
      title: 'Practice',
      passPercent: 100,
      questions: [{
        id: 'question-one',
        prompt: 'Pick yes',
        answer: 'yes',
        options: [{ id: 'yes', text: 'Yes' }],
      }],
    };

    await act(() => render(h(Quiz, {
      quizData,
      lessonId: 'lesson-one',
      onQuizResult,
      onBack: vi.fn(),
      onNext: vi.fn(),
    }), container));
    await act(() => container.querySelector('input[value="yes"]').click());
    const submitButton = container.querySelector('button[type="submit"]');
    await act(() => {
      submitButton.click();
      submitButton.click();
    });

    expect(onQuizResult).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Saving result...');
    resolveSave();
    await vi.waitFor(() => expect(container.textContent).toContain('Score: 1 of 1 (100%).'));
  });
});