import { useEffect, useState } from 'react';
import apiClient from '../../config/api';

function PrinterConfigPage() {
    const [printers, setPrinters] = useState<any>([]);
    const [newPrinter, setNewPrinter] = useState({
        name: '',
        type: 'EPSON',
        interface_type: 'USB',
        usb_identifier: '',
        network_ip: '',
        network_port: 9100,
    });

    useEffect(() => {
        async function fetchData() {
            const data = await apiClient.getPrinters();
            setPrinters(data);
        }
        fetchData();
    }, []);

    const savePrinter = async () => {
        await fetch('http://localhost:3001/api/printer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPrinter),
        });
        // refresh
        const data = await fetch('http://localhost:3001/api/printer').then(r => r.json());
        setPrinters(data);
    };

    return (
        <div>
            <h2>Printer Configuration</h2>

            <div>
                <h3>Add New Printer</h3>
                <input placeholder="Name" value={newPrinter.name} onChange={e => setNewPrinter({ ...newPrinter, name: e.target.value })} />
                <select value={newPrinter.type} onChange={e => setNewPrinter({ ...newPrinter, type: e.target.value })}>
                    <option>EPSON</option>
                    <option>STAR</option>
                    <option>GENERIC</option>
                </select>
                <select value={newPrinter.interface_type} onChange={e => setNewPrinter({ ...newPrinter, interface_type: e.target.value })}>
                    <option>USB</option>
                    <option>NETWORK</option>
                </select>
                {newPrinter.interface_type === 'USB' && (
                    <input placeholder="USB Identifier" value={newPrinter.usb_identifier} onChange={e => setNewPrinter({ ...newPrinter, usb_identifier: e.target.value })} />
                )}
                {newPrinter.interface_type === 'NETWORK' && (
                    <>
                        <input placeholder="IP" value={newPrinter.network_ip} onChange={e => setNewPrinter({ ...newPrinter, network_ip: e.target.value })} />
                        <input placeholder="Port" type="number" value={newPrinter.network_port} onChange={e => setNewPrinter({ ...newPrinter, network_port: parseInt(e.target.value) })} />
                    </>
                )}
                <button onClick={savePrinter}>Save Printer</button>
            </div>

            <h3>Configured Printers</h3>
            <ul>
                {printers.map(p => (
                    <li key={p.id}>{p.name} - {p.interface_type} - {p.type}</li>
                ))}
            </ul>
        </div>
    );
}

export default PrinterConfigPage;
