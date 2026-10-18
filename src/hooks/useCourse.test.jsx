import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCourse } from './useCourse';

const mocks = vi.hoisted(() => ({
  loadCoursePackage: vi.fn(),
  releasePackageAssets: vi.fn(),
  resolvePackageAsset: vi.fn(),
  getCourseProgress: vi.fn(),
  saveCourseProgress: vi.fn(),
  registry: { courses: [] },
}));

vi.mock('../contexts/LibraryContext', () => ({
  useLibrary: () => ({ registry: mocks.registry }),
}));
vi.mock('../lib/coursePackages', () => ({
  loadCoursePackage: mocks.loadCoursePackage,
  releasePackageAssets: mocks.releasePackageAssets,
  resolvePackageAsset: mocks.resolvePackageAsset,
}));
vi.mock('../lib/courseStorage', () => ({
  getCourseProgress: mocks.getCourseProgress,
  saveCourseProgress: mocks.saveCourseProgress,
}));

let courseState;
function CourseHarness({ courseId }) {
  courseState = useCourse(courseId);
  return h('div', null, courseState.loading ? 'loading' : courseState.error || courseState.course?.title || 'empty');
}

describe('useCourse loading state', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mocks.loadCoursePackage.mockReset();
    mocks.releasePackageAssets.mockReset();
    mocks.resolvePackageAsset.mockReset();
    mocks.getCourseProgress.mockReset().mockResolvedValue({ stepIndex: 0 });
    mocks.saveCourseProgress.mockReset().mockResolvedValue(undefined);
    mocks.releasePackageAssets.mockImplementation(() => {
      expect(container.textContent).not.toBe('First course');
    });
    courseState = null;
  });

  afterEach(() => {
    act(() => render(null, container));
    container.remove();
  });

  it('clears the previous course and progress index when a course load fails', async () => {
    const loadedPackage = {
      course: { id: 'first-course', title: 'First course' },
      lessons: [{ id: 'lesson', title: 'Lesson', pages: [{ id: 'page', heading: 'Page', blocks: [] }] }],
      files: {},
      baseUrl: null,
      placement: 'library',
    };
    mocks.loadCoursePackage.mockImplementation((courseId) => courseId === 'first-course'
      ? Promise.resolve(loadedPackage)
      : Promise.reject(new Error('Course unavailable.')));

    await act(() => {
      render(h(CourseHarness, { courseId: 'first-course' }), container);
    });
    await vi.waitFor(() => expect(courseState.course).toEqual(loadedPackage.course));
    expect(courseState.course).toEqual(loadedPackage.course);
    expect(courseState.stepIndex).toBe(0);
    expect(mocks.releasePackageAssets).not.toHaveBeenCalled();

    await act(() => {
      render(h(CourseHarness, { courseId: 'missing-course' }), container);
    });
    await vi.waitFor(() => expect(courseState.error).toBe('Course unavailable.'));

    expect(courseState.course).toBeNull();
    expect(courseState.lessons).toEqual([]);
    expect(courseState.currentStep).toBeNull();
    expect(courseState.stepIndex).toBe(-1);
    expect(courseState.error).toBe('Course unavailable.');
    expect(container.textContent).toBe('Course unavailable.');
    expect(mocks.releasePackageAssets).toHaveBeenCalledWith(loadedPackage);
  });
});
