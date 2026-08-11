import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = () => {
  const { toastMessage } = useContext(AuthContext);

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const bgMap = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    error: 'bg-rose-600 text-white shadow-rose-500/20',
    info: 'bg-amber-600 text-white shadow-amber-500/20'
  };

  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${bgMap[type] || bgMap.info}`}>
        {iconMap[type] || iconMap.info}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default NotificationToast;
