import { toast, Id } from 'react-toastify';

export class ToastService {

    static lastSuccessToastId: Id | null = null;

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
        if (this.lastSuccessToastId) {
            toast.dismiss(this.lastSuccessToastId);
        }

        this.lastSuccessToastId = toast.success(msg, {
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
        console.error(`Axios error: ${context}: ${err}`)

        if (err.response !== undefined) {
            if (err.response.hasOwnProperty('data')){
                const data = err.response.data
                if (data.hasOwnProperty('error')){
                    const errorDetails = data.error
                    this.toastError(`${context}: ${errorDetails}`);
                    return
                }
            }
        }

        this.toastError(`${context}: ${err}`);
    }
    
}
