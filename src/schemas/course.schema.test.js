import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';
import courseSchema from './course.schema.json';

const validateCourse = new Ajv({ allErrors: true }).compile(courseSchema);

function course(overrides = {}) {
  return {
    formatVersion: 1,
    id: 'org.example.metadata-test',
    version: '1.0.0',
    title: 'Metadata test',
    publisherId: 'example',
    language: 'en',
    license: 'CC0-1.0',
    lessons: [{ id: 'lesson-one', title: 'Lesson one', file: 'lessons/one.json' }],
    ...overrides,
  };
}

function validationMessages(value) {
  validateCourse(value);
  return validateCourse.errors?.map((error) => `${error.instancePath} ${error.message}`).join('; ');
}

describe('course metadata schema', () => {
  it('accepts valid metadata, including an empty draft summary and publisher-defined categories', () => {
    expect(validateCourse(course({
      shortDescription: '',
      targetAudience: 'general',
      categories: [
        { category: 'publisher-defined', subcategory: 'special-topic' },
        { category: 'history' },
      ],
    }))).toBe(true);
  });

  it.each([
    'preschool',
    'elementary',
    'middle-school',
    'high-school',
    'college',
    'general',
  ])('accepts the %s target audience', (targetAudience) => {
    expect(validateCourse(course({ targetAudience }))).toBe(true);
  });

  it('accepts a legacy manifest that omits all new metadata', () => {
    expect(validateCourse(course())).toBe(true);
  });

  it.each([
    ['a summary over 160 characters', { shortDescription: 'x'.repeat(161) }, 'must NOT have more than 160 characters'],
    ['a non-string summary', { shortDescription: 12 }, 'must be string'],
    ['an unknown audience', { targetAudience: 'professional' }, 'must be equal to one of the allowed values'],
    ['an empty categories array', { categories: [] }, 'must NOT have fewer than 1 items'],
    ['more than three categories', { categories: [
      { category: 'one' }, { category: 'two' }, { category: 'three' }, { category: 'four' },
    ] }, 'must NOT have more than 3 items'],
    ['a category missing its ID', { categories: [{ subcategory: 'topic' }] }, "must have required property 'category'"],
    ['an empty category ID', { categories: [{ category: '' }] }, 'must NOT have fewer than 1 characters'],
    ['an empty subcategory ID', { categories: [{ category: 'history', subcategory: '' }] }, 'must NOT have fewer than 1 characters'],
    ['an extra category property', { categories: [{ category: 'history', label: 'History' }] }, 'must NOT have additional properties'],
    ['an exact duplicate category entry', { categories: [
      { category: 'history' }, { category: 'history' },
    ] }, 'must NOT have duplicate items'],
  ])('rejects %s with a useful error', (_label, metadata, expectedMessage) => {
    expect(validateCourse(course(metadata))).toBe(false);
    expect(validationMessages(course(metadata))).toContain(expectedMessage);
  });
});
