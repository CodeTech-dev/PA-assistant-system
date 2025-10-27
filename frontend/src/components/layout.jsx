import React, { useState } from 'react'; // 1. Import useState
import Sidebar from "./sidebar";
import Header from './header'; // 2. Import the new Header
import '../styles/layout.css'

const Layout = ({children}) => {
    // 3. Add state for the mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 4. Add the toggle function
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return(
        // 5. Add a class to the layout based on the state
        <div className={`app-layout ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            <Sidebar />
            <main className="main-container">
                {/* 6. Add the Header, passing state and toggle function */}
                <Header 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    onToggleMenu={toggleMobileMenu}
                />
                {/* 7. Wrap children in another div for cleaner styling (optional but recommended) */}
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;