import "../styles/sidebar.css";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="navigation">
      <div className="logo">
        <h1>
          <i className="fa fa-desktop"></i>
          <span>PAs Assistant</span>
        </h1>
      </div>


      <ul className="nav-link">
        <li>
          <NavLink to="/dashboard">
            <i className="fa fa-home"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/calendar">
            <i className="fa fa-calendar"></i>
            <span>Calendar</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/tasks">
            <i className="fa fa-tasks"></i>
            <span>Tasks</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/contacts">
            <i className="fa-solid fa-address-book"></i>
            <span>Contacts</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/notifications">
            <i className="fa fa-user"></i>
            <span>Notifications</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
