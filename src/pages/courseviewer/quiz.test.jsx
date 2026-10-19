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

  it('sends each submitted result with its lesson ID', async () => {
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

    expect(onQuizResult).toHaveBeenCalledWith('lesson-one', {
      correct: 1,
      total: 1,
      percent: 100,
      passed: true,
    });
  });
});