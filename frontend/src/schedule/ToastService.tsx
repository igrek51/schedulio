import { toast } from 'react-toastify';

export class ToastService {

    static toastInfo(msg: string) {
        toast.info(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    static toastError(msg: string) {
        toast.error(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    static toastSuccess(msg: string) {
        toast.success(msg, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    static showAxiosError(context: string, err: any) {
        if (err.response.hasOwnProperty('data')){
            const data = err.response.data
            if (data.hasOwnProperty('error')){
                const errorDetails = data.error
                this.toastError(`${context}: ${errorDetails}`);
                return
            }
        }

        this.toastError(`${context}: ${err}`);
    }
    
}
