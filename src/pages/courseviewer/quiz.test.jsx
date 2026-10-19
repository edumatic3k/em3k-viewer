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

    expect(onQuizResult).toHaveBeenCalledWith('lesson-one', expect.objectContaining({
      answers: { 'question-one': 'yes' },
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    }));
    const firstAttemptId = onQuizResult.mock.calls[0][1].attemptId;
    expect(firstAttemptId).toEqual(expect.any(String));

    const submittedAttempt = onQuizResult.mock.calls[0][1];
    await act(() => render(null, container));
    await act(() => render(h(Quiz, {
      quizData,
      lessonId: 'lesson-one',
      attempt: submittedAttempt,
      isFreshQuiz: true,
      onQuizResult,
      onBack: vi.fn(),
      onReviewAnswers: vi.fn(),
    }), container));
    expect(container.querySelector('input[value="yes"]').checked).toBe(false);
    await act(() => container.querySelector('input[value="no"]').click());
    await act(() => container.querySelector('button[type="submit"]').click());
    await vi.waitFor(() => expect(onQuizResult).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(container.textContent).toContain('Score: 0 of 1 (0%).'));
    expect(onQuizResult).toHaveBeenNthCalledWith(2, 'lesson-one', expect.objectContaining({
      answers: { 'question-one': 'no' },
      correct: 0,
      total: 1,
      percent: 0,
      passed: false,
    }));
    expect(onQuizResult.mock.calls[1][1].attemptId).not.toBe(firstAttemptId);
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
    const failedAttemptId = onQuizResult.mock.calls[0][1].attemptId;
    expect(onQuizResult).toHaveBeenNthCalledWith(1, 'lesson-one', expect.objectContaining({
      answers: { 'question-one': 'yes' },
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    }));

    await act(() => container.querySelector('button[type="button"].btn-primary').click());
    await vi.waitFor(() => expect(container.textContent).toContain('Score: 1 of 1 (100%).'));
    expect(onQuizResult).toHaveBeenCalledTimes(2);
    expect(onQuizResult).toHaveBeenNthCalledWith(2, 'lesson-one', expect.objectContaining({
      answers: { 'question-one': 'yes' },
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    }));
    expect(onQuizResult.mock.calls[1][1].attemptId).toBe(failedAttemptId);
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

  it('requires every answer and confirms Reset Form without touching saved attempts', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onQuizResult = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const quizData = {
      title: 'Practice',
      passPercent: 50,
      questions: [
        { id: 'q1', prompt: 'One', answer: 'a', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }] },
        { id: 'q2', type: 'true-false', prompt: 'Two', answer: true },
      ],
    };

    await act(() => render(h(Quiz, {
      quizData,
      lessonId: 'lesson-one',
      onQuizResult,
      onBack: vi.fn(),
      onReviewAnswers: vi.fn(),
    }), container));

    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
    await act(() => container.querySelector('input[value="a"]').click());
    expect(submitButton.disabled).toBe(true);
    await act(() => container.querySelector('input[value="true"]').click());
    expect(submitButton.disabled).toBe(false);

    const resetButton = [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Reset Form');
    await act(() => resetButton.click());
    expect(confirm).toHaveBeenCalledWith("This will erase the form and you'll lose all your answers. Are you sure you want to do this?");
    expect(container.querySelector('input[value="a"]').checked).toBe(true);
    expect(container.querySelector('input[value="true"]').checked).toBe(true);

    confirm.mockReturnValue(true);
    await act(() => resetButton.click());
    expect(container.querySelector('input[value="a"]').checked).toBe(false);
    expect(container.querySelector('input[value="true"]').checked).toBe(false);
    expect(onQuizResult).not.toHaveBeenCalled();
  });

  it('restores submitted answers read-only and navigates to review without another submission', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    const onQuizResult = vi.fn();
    const onReviewAnswers = vi.fn();
    const quizData = {
      title: 'Practice',
      passPercent: 70,
      questions: [{ id: 'question-one', prompt: 'Pick yes', answer: 'yes', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] }],
    };
    const attempt = {
      attemptId: 'attempt-one',
      answers: { 'question-one': 'yes' },
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    };

    await act(() => render(h(Quiz, {
      quizData,
      lessonId: 'lesson-one',
      attempt,
      onQuizResult,
      onBack: vi.fn(),
      onReviewAnswers,
    }), container));

    expect(container.querySelector('input[value="yes"]').checked).toBe(true);
    expect(container.querySelector('input[value="yes"]').disabled).toBe(true);
    expect(container.textContent).toContain('Review Answers');
    expect(container.textContent).not.toContain('Reset Form');
    await act(() => [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Review Answers').click());
    expect(onReviewAnswers).toHaveBeenCalledTimes(1);
    expect(onQuizResult).not.toHaveBeenCalled();
  });

  it('clearly identifies historical read-only attempts without stored answers', async () => {
    container = document.createElement('div');
    document.body.appendChild(container);

    await act(() => render(h(Quiz, {
      quizData: {
        title: 'Practice',
        passPercent: 70,
        questions: [{ id: 'q1', prompt: 'Pick yes', answer: 'yes', options: [{ id: 'yes', text: 'Yes' }] }],
      },
      lessonId: 'lesson-one',
      attempt: { lessonId: 'lesson-one', score: 1, total: 1, percent: 100, passed: true },
      onBack: vi.fn(),
      onReviewAnswers: vi.fn(),
    }), container));

    expect(container.textContent).toContain('Score: 1 of 1 (100%).');
    expect(container.textContent).toContain('Submitted responses are not available for this historical attempt.');
    expect(container.querySelector('input[value="yes"]').checked).toBe(false);
    expect(container.querySelector('input[value="yes"]').disabled).toBe(true);
    expect(container.textContent).toContain('Review Answers');
    expect(container.textContent).not.toContain('Reset Form');
  });
});