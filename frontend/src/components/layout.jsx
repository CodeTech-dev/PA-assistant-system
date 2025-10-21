import Sidebar from "./sidebar";
import '../styles/layout.css'

const Layout = ({children}) => {
    return(
        <div className="app-layout">
            <Sidebar />
            <main className="main-container">
                {children}
            </main>
        </div>
    );
}
export default Layout;