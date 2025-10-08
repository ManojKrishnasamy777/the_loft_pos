// src/components/ReceiptPreview.tsx
import React from 'react';
import { usePrinter } from '../../services/usePrinter';
import { Receipt } from '../../types';


interface ReceiptPreviewProps {
    receipt: Receipt;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ receipt }) => {
    const { printReceipt, isPrinting } = usePrinter();

    return (
        <div style={{ display: 'flex', gap: '2rem' }}>
            {/* Receipt Preview */}
            <div style={{ padding: '1rem', border: '1px solid #ccc', width: '300px' }}>
                {receipt.logo && <img src={receipt.logo} alt="Logo" style={{ maxWidth: '100%' }} />}
                <h3 style={{ textAlign: 'center' }}>{receipt.storeName}</h3>
                <p style={{ textAlign: 'center' }}>{receipt.address}</p>
                <hr />
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {receipt.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.name}</td>
                                <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                <td style={{ textAlign: 'right' }}>${item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <hr />
                <h4 style={{ textAlign: 'right' }}>Total: ${receipt.total}</h4>
                {receipt.qrCode && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                                receipt.qrCode
                            )}&size=100x100`}
                            alt="QR Code"
                        />
                    </div>
                )}
            </div>

            {/* Print Button */}
            <div>
                <button
                    onClick={() => printReceipt(receipt)}
                    disabled={isPrinting}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {isPrinting ? 'Printing...' : 'Print Receipt'}
                </button>
            </div>
        </div>
    );
};

export default ReceiptPreview;
