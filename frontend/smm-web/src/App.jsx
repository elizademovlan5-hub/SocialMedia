import { useEffect } from 'react';

import AppRoutes from './routes/AppRoutes';

import useNotificationSignalR from './features/notifications/hooks/useNotificationSignalR';
import useChatSignalR from "./features/messages/hooks/useChatSignalR";
import {
  unlockMessageSound,
} from './utils/messageSound';

export default function App() {
  useNotificationSignalR();

  useChatSignalR();

  useEffect(() => {
    const unlock = () => {
      unlockMessageSound();

      window.removeEventListener(
        'click',
        unlock
      );

      window.removeEventListener(
        'keydown',
        unlock
      );
    };

    window.addEventListener(
      'click',
      unlock
    );

    window.addEventListener(
      'keydown',
      unlock
    );

    return () => {
      window.removeEventListener(
        'click',
        unlock
      );

      window.removeEventListener(
        'keydown',
        unlock
      );
    };
  }, []);

  return <AppRoutes />;
}