const formatDate = (date) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('ru-RU', options);
};

const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' лет назад';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' месяцев назад';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' дней назад';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' часов назад';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' минут назад';
    
    return 'только что';
};

const isDateInRange = (date, startDate, endDate) => {
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
};

module.exports = { formatDate, getTimeAgo, isDateInRange }; 