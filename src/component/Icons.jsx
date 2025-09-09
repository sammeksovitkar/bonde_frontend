import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faIdCard, faVenusMars, faPhone, faEnvelope, faMapMarkerAlt, faDollarSign, faCalendarAlt, faTrashAlt, faPencilAlt, faEye, faHouse, faArrowLeft, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'; // ⭐️ Added faCheck and faTimes here

// Inline SVG icons from the original code
export const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export const MaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
    <path d="M10 12l-6 6"></path>
    <path d="M20 6l-6 6"></path>
    <path d="M12 10v10"></path>
  </svg>
);

export const FemaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white w-6 h-6">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 2v6"></path>
    <path d="M12 18v4"></path>
    <path d="M17 12h4"></path>
    <path d="M3 12h4"></path>
  </svg>
);

export const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-4 h-4">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="22" y1="11" x2="16" y2="11"></line>
  </svg>
);

export const SittingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 w-5 h-5"><rect x="1" y="2" width="22" height="15" rx="2" ry="2"></rect><path d="M7 21v-2"></path><path d="M17 21v-2"></path></svg>
);

// Font Awesome icons
export const FaUser = () => <FontAwesomeIcon icon={faUser} />;
export const FaIdCard = () => <FontAwesomeIcon icon={faIdCard} />;
export const FaVenusMars = () => <FontAwesomeIcon icon={faVenusMars} />;
export const FaPhone = () => <FontAwesomeIcon icon={faPhone} />;
export const FaEnvelope = () => <FontAwesomeIcon icon={faEnvelope} />;
export const FaMapMarkerAlt = () => <FontAwesomeIcon icon={faMapMarkerAlt} />;
export const FaDollarSign = () => <FontAwesomeIcon icon={faDollarSign} />;
export const FaCalendarAlt = () => <FontAwesomeIcon icon={faCalendarAlt} />;
export const FaTrashAlt = () => <FontAwesomeIcon icon={faTrashAlt} />;
export const FaPencilAlt = () => <FontAwesomeIcon icon={faPencilAlt} />;
export const FaEye = () => <FontAwesomeIcon icon={faEye} />;
export const FaHouse = () => <FontAwesomeIcon icon={faHouse} />;
export const FaArrowLeft = () => <FontAwesomeIcon icon={faArrowLeft} />;
// ⭐️ NEW: Added FaCheck and FaTimes icons
export const FaCheck = () => <FontAwesomeIcon icon={faCheck} />;
export const FaTimes = () => <FontAwesomeIcon icon={faTimes} />;