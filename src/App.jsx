
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './pages/Dashboard';
// import Landing from './pages/Landing';
// import Metric from './pages/Metric';
// import Trends from './pages/Trends';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Landing />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/landing" element={<Landing />} />
//         <Route path="/metric" element={<Metric />} />
//         <Route path="/trends" element={<Trends />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Metric from './pages/Metric';
import Trends from './pages/Trends';
import SignInPage from './pages/SignInPage';
import Scope from './pages/Scope';


// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/sign-in" element={<SignInPage />} />

          {/* Protected Routes - require authentication */}
          <Route 
            path="/dashboard" 
            element={
              <>
                <SignedIn>
                  <Dashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/metric" 
            element={
              <>
                <SignedIn>
                  <Metric />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />
          
          <Route 
            path="/trends" 
            element={
              <>
                <SignedIn>
                  <Trends />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />

          <Route 
            path="/scope" 
            element={
              <>
                <SignedIn>
                  <Scope />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;