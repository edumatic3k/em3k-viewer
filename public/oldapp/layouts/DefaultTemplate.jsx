import ValidationErrorAlert from '../components/ui/ValidationErrorAlert';
import Header from '../components/ui/Header';   
import Footer from '../components/ui/Footer';

export default function DefaultTemplate({ children, title, showHeader = true, showFooter = true, currentRoute = null }) {
  return (
    <div className="app-wrapper">
      {showHeader && <Header title={title} currentRoute={currentRoute} />}
      
      <main>
        <ValidationErrorAlert />
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}