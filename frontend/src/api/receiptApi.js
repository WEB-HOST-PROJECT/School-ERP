import API from './api';

export const getReceiptById = async (receiptId) => {
    return API.get(`/api/receipts/${receiptId}`);
};

export const getStudentReceipts = async (studentId) => {
    return API.get(`/api/receipts/student/${studentId}`);
};

export const downloadReceiptPdf = async (receiptId, receiptNo) => {
    try {
        const response = await API.get(`/api/receipts/${receiptId}/print`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${receiptNo}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Failed to download receipt:", error);
        throw error;
    }
};

export const generateReceipt = async (paymentId) => {
    return API.post(`/api/receipts/generate`, { paymentId });
};
