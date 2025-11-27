import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'components/Atoms/Container/Container';
import styles from './AppHeader.module.css';

interface UserData {
  email?: string;
  firstName?: string;
  id?: string;
  imageUrl?: string;
  lastName?: string;
}

interface PrayerTime {
  name: string;
  next: boolean;
  time: string;
}

interface WeatherData {
  icon: string;
  temp: number;
}

const AppHeader: FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prayerTime, setPrayerTime] = useState<PrayerTime | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('wefixUser');

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);

        // Ensure firstName and lastName are available
        if (parsedUser && (parsedUser.firstName || parsedUser.lastName)) {
          setUser(parsedUser);
        } else {
          console.warn('User data missing firstName or lastName:', parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Update current time every minute
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;

      setCurrentTime(`${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 60000);

    // Fetch weather for Amman
    fetchWeather();

    // Calculate prayer times for Amman
    calculatePrayerTimes();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const fetchWeather = async () => {
    try {
      // Using a free weather API (wttr.in) for Amman
      const response = await fetch('https://wttr.in/Amman?format=j1').catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        const current = data.current_condition?.[0];

        if (current) {
          setWeather({
            icon: current.weatherCode || '01d',
            temp: parseInt(current.temp_C, 10) || 23,
          });

          return;
        }
      }

      // Fallback to default weather
      setWeather({ icon: '01d', temp: 23 });
    } catch (error) {
      // Fallback to default weather
      setWeather({ icon: '01d', temp: 23 });
    }
  };

  const calculatePrayerTimes = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();

      // Using Aladhan API for prayer times in Amman
      const response = await fetch(
        `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=31.9539&longitude=35.9106&method=4`
      ).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        const todayPrayers = data.data?.[day - 1]?.timings;

        if (todayPrayers) {
          const prayers = [
            { minutes: parseTime(todayPrayers.Fajr), name: 'Fajr', time: todayPrayers.Fajr?.substring(0, 5) || '05:30' },
            { minutes: parseTime(todayPrayers.Dhuhr), name: 'Dhuhr', time: todayPrayers.Dhuhr?.substring(0, 5) || '12:30' },
            { minutes: parseTime(todayPrayers.Asr), name: 'Asr', time: todayPrayers.Asr?.substring(0, 5) || '15:45' },
            { minutes: parseTime(todayPrayers.Maghrib), name: 'Maghrib', time: todayPrayers.Maghrib?.substring(0, 5) || '18:15' },
            { minutes: parseTime(todayPrayers.Isha), name: 'Isha', time: todayPrayers.Isha?.substring(0, 5) || '19:45' },
          ];

          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
          let nextPrayer = prayers.find((p) => p.minutes > currentTimeMinutes);

          if (!nextPrayer) {
            nextPrayer = prayers[0]; // Use first prayer of next day
          }

          setPrayerTime({
            name: nextPrayer.name,
            next: true,
            time: nextPrayer.time,
          });

          return;
        }
      }

      // Fallback to approximate times
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const prayers = [
        { minutes: 5 * 60 + 30, name: 'Fajr', time: '05:30' },
        { minutes: 12 * 60 + 30, name: 'Dhuhr', time: '12:30' },
        { minutes: 15 * 60 + 45, name: 'Asr', time: '15:45' },
        { minutes: 18 * 60 + 15, name: 'Maghrib', time: '18:15' },
        { minutes: 19 * 60 + 45, name: 'Isha', time: '19:45' },
      ];

      let nextPrayer = prayers.find((p) => p.minutes > currentTimeMinutes);

      if (!nextPrayer) {
        nextPrayer = prayers[0];
      }

      setPrayerTime({
        name: nextPrayer.name,
        next: true,
        time: nextPrayer.time,
      });
    } catch (error) {
      // Fallback to default times
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const prayers = [
        { minutes: 12 * 60 + 30, name: 'Dhuhr', time: '12:30' },
      ];
      const nextPrayer = prayers.find((p) => p.minutes > currentTimeMinutes) || prayers[0];

      setPrayerTime({
        name: nextPrayer.name,
        next: true,
        time: nextPrayer.time,
      });
    }
  };

  const parseTime = (timeString: string): number => {
    if (!timeString) {
      return 0;
    }

    const [hours, minutes] = timeString.substring(0, 5).split(':').map(Number);

    return (hours || 0) * 60 + (minutes || 0);
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (user?.email) {
      return user.email[0].toUpperCase();
    }

    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      const capitalizeFirst = (str: string) => {
        if (!str) {
          return '';
        }

        // Handle multiple words (e.g., "super admin" -> "Super Admin")
        return str
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };

      const firstName = capitalizeFirst(user.firstName);
      const lastName = capitalizeFirst(user.lastName);

      return `${firstName} ${lastName}`;
    }

    if (user?.firstName) {
      const capitalizeFirst = (str: string) => {
        if (!str) {
          return '';
        }

        return str
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      };

      return capitalizeFirst(user.firstName);
    }

    if (user?.email) {
      return user.email.split('@')[0];
    }

    return 'User';
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <Container className={styles.header}>
      {/* Left Side - User Avatar & Name + Navigation */}
      <Container className={styles.leftSection}>
        <Container className={styles.userAvatar}>
          {user?.imageUrl ? (
            <img alt="User" className={styles.avatarImage} src={user.imageUrl} />
          ) : (
            <Container className={styles.avatarInitials}>{getUserInitials()}</Container>
          )}
          <div className={styles.onlineIndicator}></div>
        </Container>
        <span className={styles.userName}>{getUserDisplayName()}</span>
        
        {/* Navigation Items */}
        <Container className={styles.leftNav}>
          <button className={styles.navItem} onClick={() => handleNavClick('/dashboard')} type="button">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </button>
          <button className={styles.navItem} onClick={() => handleNavClick('/menu')} type="button">
            <i className="fas fa-bars"></i>
            <span>Menu</span>
          </button>
          <button className={styles.navItem} onClick={() => handleNavClick('/reports')} type="button">
            <i className="fas fa-chart-line"></i>
            <span>Reports</span>
          </button>
          <button className={styles.navItem} onClick={() => handleNavClick('/notifications')} type="button">
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
          </button>
        </Container>
      </Container>

      {/* Right Info */}
      <Container className={styles.rightInfo}>
        {/* Weather */}
        <Container className={styles.infoItem}>
          {weather && (
            <>
              <span className={styles.weatherTemp}>{weather.temp}°C</span>
              <i className={`fas fa-sun ${styles.weatherIcon}`}></i>
            </>
          )}
        </Container>

        {/* Time */}
        <Container className={styles.infoItem}>
          <span className={styles.timeText}>{currentTime}</span>
        </Container>

        {/* Prayer Time */}
        {prayerTime && (
          <Container className={styles.infoItem}>
            <i className={`fas fa-mosque ${styles.prayerIcon}`}></i>
            <Container className={styles.prayerInfo}>
              <span className={styles.prayerName}>{prayerTime.name}</span>
              <span className={styles.prayerTime}>{prayerTime.time}</span>
            </Container>
          </Container>
        )}

      </Container>
    </Container>
  );
};

export default AppHeader;
