import { useLibrary } from '../contexts/LibraryContext.jsx';
import { Link } from '../components/ui/Link.jsx';
import DefaultLayout from '../layouts/DefaultLayout.jsx';

/**
 * @typedef {import('../contexts/LibraryContext.jsx').Course} Course
 */

export default function Library() {
  const {
    activeCourses,
    installedCourses,
    systemCourses,
    loading,
    error,
  } = useLibrary();

  if (loading) {
    return (
      <DefaultLayout title="Library">
        <div className="p-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading your library...</p>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout title="Error">
        <div className="alert alert-danger mt-4">
          Error loading library: {error}
        </div>
      </DefaultLayout>
    );
  }

  /** @type {Course[]} */
  const visibleCourses = [...(installedCourses || []), ...(systemCourses || [])];

  return (
    <DefaultLayout title="Library">
      <div className="container-fluid">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5">Library</h1>
          <button type="button" className="btn btn-outline-secondary btn-lg">
            <i className="bi bi-book me-2"></i>Course Catalog
          </button>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              style={{ width: '280px' }}
            />
            <select className="form-select" style={{ width: 'auto' }}>
              <option value="all">Show All</option>
              <option value="active">Show Active</option>
              <option value="installed">Show Inactive</option>
            </select>
          </div>

        </div>

        <h3>Active Courses</h3>
        <div className="table-responsive border border-1 border-secondary rounded-4 p-3 mb-4">
          <table className="table table-hover align-middle">
            <thead className="table-success">
              <tr>
                <th>Course Title</th>
                <th>Teacher</th>
                <th>Status</th>
                <th>Last Viewed</th>
                <th>Progress</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => {
                /** @type {boolean} */
                const isActive = Array.isArray(activeCourses)
                  ? activeCourses.some((c) => c?.slug === course.slug)
                  : false;

                return (
                  <tr key={course.slug}>
                    <td>
                      <strong>{course.name || course.slug}</strong>
                    </td>
                    <td>{course.teacherSlug || 'EM3K System'}</td>
                    <td>
                      <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>Jun 20 2026 08:25 AM</td>
                    <td>
                      <div className="progress border border-1 border-dark" style={{ width: '140px', height: '8px' }}>
                        <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                      </div>
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/course/${course.slug}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        Details
                      </Link>
                      <button className="btn btn-sm btn-outline-danger">Uninstall</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <h3>Inactive Courses</h3>
        <div className="table-responsive border border-1 border-secondary rounded-4 p-3 mb-5">
          <table className="table table-hover align-middle">
            <thead className="table-danger">
              <tr>
                <th>Course Title</th>
                <th>Teacher</th>
                <th>Status</th>
                <th>Last Viewed</th>
                <th>Progress</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => {
                /** @type {boolean} */
                const isActive = Array.isArray(activeCourses)
                  ? activeCourses.some((c) => c?.slug === course.slug)
                  : false;

                return (
                  <tr key={course.slug}>
                    <td>
                      <strong>{course.name || course.slug}</strong>
                    </td>
                    <td>{course.teacherSlug || 'EM3K System'}</td>
                    <td>
                      <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>Jun 20 2026 08:25 AM</td>
                    <td>
                      <div className="progress border border-1 border-dark" style={{ width: '140px', height: '8px' }}>
                        <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                      </div>
                    </td>
                    <td className="text-end">
                      <Link
                        href={`/course/${course.slug}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        Details
                      </Link>
                      <button className="btn btn-sm btn-outline-danger">Uninstall</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCourses.length === 0 && (
          <div className="alert alert-info text-center py-5">
            Your library is empty.<br />
            Visit the Catalog to install your first course.
          </div>
        )}

      </div>
    </DefaultLayout>
  );
};