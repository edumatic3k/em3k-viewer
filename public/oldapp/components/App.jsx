import { useEffect } from 'preact/hooks';
import Router from 'preact-router';
import DefaultTemplate from '@layouts/DefaultTemplate.jsx';
import { HomePage } from '@pages/Home.jsx';
import { IntroPage } from '@pages/Intro.jsx';
import { StudentInfoPage } from '@pages/StudentInfo.jsx';
import { ErrorPage } from '@pages/Error.jsx';
import { NotFound } from '@pages/NotFound.jsx';
import { LessonIntroRoute } from '@components/routes/LessonIntroRoute.jsx';
import { LessonsIndexRoute } from '@components/routes/LessonsIndexRoute.jsx';
import { LessonPageRoute } from '@components/routes/LessonPageRoute.jsx';
import { QuizPageRoute } from '@components/routes/QuizPageRoute.jsx';
import { AnswersPageRoute } from '@components/routes/AnswersPageRoute.jsx';
import { CertificatePageRoute } from '@/components/routes/CertificatePageRoute.jsx';
import { CompletionPageRoute } from '@/components/routes/CompletionPageRoute.jsx';
import { useRouteGuard } from '@contexts/RouteGuardContext.jsx';
import { LinearFlowModal } from '@components/modals/LinearFlowModal.jsx';

export function App() {

  const { handleRouteChange, linearModalVisible, modalLessonId, modalLessonNumber, modalAllowedPage, closeModal, currentRoute } = useRouteGuard();

  useEffect(() => {
    if (currentRoute) {
      console.log(`You're on ${currentRoute}`);
    }
  }, [currentRoute]);

  // compute per-route layout flags
  const isHome = currentRoute === '/' || currentRoute === undefined;
  const showHeader = !isHome;
  const showFooter = true;

  return (
    <DefaultTemplate showHeader={showHeader} showFooter={showFooter} currentRoute={currentRoute}>
      <Router onChange={handleRouteChange}>
        <HomePage path="/" />
        <IntroPage path="/intro" />
        <StudentInfoPage path="/studentinfo" />
        <LessonIntroRoute path="/lessons/:id/:lessonNumber/intro" />
        <LessonPageRoute path="/lessons/:id/:lessonNumber/page/:page" />
        <QuizPageRoute path="/lessons/:id/:lessonNumber/quiz" />
        <AnswersPageRoute path="/lessons/:id/:lessonNumber/answers" />
        <LessonsIndexRoute path="/lessons/:id/" />
        <LessonsIndexRoute path="/lessons/:id" />
        <LessonsIndexRoute path="/lessons/" />
        <LessonsIndexRoute path="/lessons" />
        <CertificatePageRoute path="/certificate" />
        <CompletionPageRoute path="/complete" />
        <ErrorPage path="/error/:code/:lessonId?/:allowedPage?" />
        <NotFound default />
      </Router>
      
      <LinearFlowModal 
        show={linearModalVisible} 
        lessonId={modalLessonId}
        lessonNumber={modalLessonNumber}
        allowedPage={modalAllowedPage} 
        onClose={closeModal} 
      />
    </DefaultTemplate>
  );
}
