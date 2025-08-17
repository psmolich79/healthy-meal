import React from 'react';
import { ToastProvider } from './toast';

interface ToastWrapperProps {
  children: React.ReactNode;
}

export const ToastWrapper: React.FC<ToastWrapperProps> = ({ children }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

export default ToastWrapper;
