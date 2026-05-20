import Navbar  from './Navbar';
import Footer  from './Footer';
import Chatbot from './Chatbot';

export default function Layout({ children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}
