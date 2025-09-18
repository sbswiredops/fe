import { useCallback } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const useToast = () => {
    const showToast = useCallback(
        (message: string, type: ToastType = 'info', options?: ToastOptions) => {
            switch (type) {
                case 'success':
                    toast.success(message, options);
                    break;
                case 'error':
                    toast.error(message, options);
                    break;
                case 'warning':
                    toast.warning(message, options);
                    break;
                default:
                    toast.info(message, options);
            }
        },
        []
    );

    return { showToast, ToastContainer };
};

export default useToast;