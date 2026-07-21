import { library } from '@fortawesome/fontawesome-svg-core';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import {
    faHome,
    faListCheck,
    faCalendarDays,
    faFaceSmile,
    faBook,
    faClipboardCheck,
    faChartLine,
    faPlus,
    faPause,
    faPlay,
    faStop,
    faFire,
    faClock,
    faCheck,
    faXmark,
    faTrash,
    faPen,
    faHeart,
    faStar,
    faMoon,
    faSun,
    faCloud,
    faBolt,
    faDroplet,
    faGear,
    faUser,
    faRightFromBracket,
    faBars,
    faChevronLeft,
    faChevronRight,
    faFlag,
    faBell,
    faCircleInfo,
    faTrophy,
    faMedal,
    faGift,
    faCalendarCheck,
    faCalendarPlus,
    faCalendarXmark,
    faCircle,
    faSquare,
    faSpinner,
    faGuitar,
    faLanguage
} from '@fortawesome/free-solid-svg-icons';

import {
    faGoogle,
    faFacebook
} from '@fortawesome/free-brands-svg-icons';

// Prevent Font Awesome from adding its CSS since we did it manually above
config.autoAddCss = false;

// Add icons to the library for global use
library.add(
    // Navigation
    faHome,
    faListCheck,
    faCalendarDays,
    faFaceSmile,
    faBook,
    faClipboardCheck,
    faChartLine,

    // Actions  
    faPlus,
    faPause,
    faPlay,
    faStop,
    faCheck,
    faXmark,
    faTrash,
    faPen,

    // Timer
    faFire,
    faClock,

    // Mood  
    faHeart,
    faStar,
    faMoon,
    faSun,
    faCloud,
    faBolt,
    faDroplet,

    // UI
    faGear,
    faUser,
    faRightFromBracket,
    faBars,
    faChevronLeft,
    faChevronRight,
    faFlag,
    faBell,
    faCircleInfo,

    // Achievements
    faTrophy,
    faMedal,
    faGift,

    // Calendar
    faCalendarCheck,
    faCalendarPlus,
    faCalendarXmark,

    // Shapes
    faCircle,
    faSquare,
    faSpinner,

    // Practice & Flashcards
    faGuitar,
    faLanguage,

    // Brands
    faGoogle,
    faFacebook
);

export { library };
