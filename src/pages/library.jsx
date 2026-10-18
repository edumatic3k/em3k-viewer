import { useState } from 'preact/hooks';
import { Link } from '../components/ui/Link.jsx';
import DefaultLayout from '../layouts/DefaultLayout.jsx';
import { useLibrary } from '../contexts/LibraryContext.jsx';

function CourseTable({ courses, onToggle, onRemove }) {
  if (!courses.length) return <p className="text-secondary">No courses in this section.</p>;

  return (
    <div className="table-responsive border border-1 border-secondary rounded-3 p-3 mb-4">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Course</th>
            <th>Publisher</th>
            <th>Version</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <strong>{course.title}</strong>
                {course.description && <div className="small text-secondary">{course.description}</div>}
              </td>
              <td>{course.teacherSlug}</td>
              <td>{course.version}</td>
              <td className="text-end text-nowrap">
                <Link href={`/course/${encodeURIComponent(course.id)}`} className="btn btn-sm btn-primary me-2">
                  Open
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => onToggle(course)}
                >
                  {course.active ? 'Deactivate' : 'Activate'}
                </button>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onRemove(course)}>
                  {course.bundled ? 'Remove' : 'Uninstall'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Library() {
  const { libraryCourses, loading, error, setCourseActive, uninstallCourse, importCourse } = useLibrary();
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setImportError('');
    setImporting(true);
    try {
      await importCourse(file);
    } catch (importFailure) {
      setImportError(importFailure instanceof Error ? importFailure.message : String(importFailure));
    } finally {
      setImporting(false);
      input.value = '';
    }
  };

  const handleRemove = async (course) => {
    const action = course.bundled ? 'hide this bundled course from your library' : 'uninstall this course';
    if (window.confirm(`Are you sure you want to ${action}?`)) await uninstallCourse(course.id);
  };

  const activeCourses = libraryCourses.filter((course) => course.active);
  const inactiveCourses = libraryCourses.filter((course) => !course.active);

  return (
    <DefaultLayout title="Library">
      <div className="container-fluid">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h1 className="display-5 mb-0">Library</h1>
          <label className="btn btn-outline-secondary">
            {importing ? 'Installing…' : 'Install course package'}
            <input type="file" accept=".zip,application/zip" className="visually-hidden" onChange={handleImport} disabled={importing} />
          </label>
        </div>

        {(error || importError) && <div className="alert alert-danger" role="alert">{error || importError}</div>}
        {loading ? (
          <p className="text-center py-5">Loading your library…</p>
        ) : (
          <>
            <h2 className="h4">Active courses</h2>
            <CourseTable
              courses={activeCourses}
              onToggle={(course) => setCourseActive(course.id, false)}
              onRemove={handleRemove}
            />
            <h2 className="h4">Inactive courses</h2>
            <CourseTable
              courses={inactiveCourses}
              onToggle={(course) => setCourseActive(course.id, true)}
              onRemove={handleRemove}
            />
            {!libraryCourses.length && (
              <div className="alert alert-info">
                Your library is empty. Install a course package or browse the catalog.
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}