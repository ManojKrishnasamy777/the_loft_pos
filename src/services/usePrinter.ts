// src/services/usePrinter.ts
import { useState } from 'react';
import { Receipt } from '../types';

export function usePrinter() {
    const [isPrinting, setIsPrinting] = useState<boolean>(false);

    const printReceipt = async (receiptData: Receipt) => {
        setIsPrinting(true);
        const token = localStorage.getItem('authToken');
        try {
            debugger
            const response = fetch('http://localhost:3001/api/receipt/print', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(receiptData),
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(err => console.error(err));

            const result: { success: boolean; message?: string } = await response;
            if (result.success) {
                alert('Receipt sent to printer!');
            } else {
                alert('Print failed: ' + result.message);
            }
        } catch (err) {
            console.error('Print request failed', err);
            alert('Print request failed.');
        } finally {
            setIsPrinting(false);
        }
    };

    return { printReceipt, isPrinting };
}
