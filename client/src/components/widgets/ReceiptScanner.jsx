import { useState, useRef } from 'react';
import { LuCamera, LuUpload, LuCircleCheck } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { scanReceipt } from "../../services/aiService";
import { uploadReceipt } from "../../services/transactionService";
import styles from './ReceiptScanner.module.css';

export default function ReceiptScanner({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setIsScanning(true);

    try {
      const fd = new FormData();
      fd.append('receipt', file);
      
      const uploadRes = await uploadReceipt(fd);
      if (uploadRes.success) {
        const result = await scanReceipt(uploadRes.url);
        if (result.success && result.extractedData) {
          const data = result.extractedData;
          if (data.isValidReceipt === false) {
            toast.error('The uploaded image does not appear to be a valid receipt or bill.', { duration: 4000 });
          } else {
            toast.success('Receipt scanned successfully!');
            
            onScanComplete({ ...data, receiptUrl: uploadRes.url });
          }
        } else {
          toast.error('Failed to extract data');
        }
      } else {
        toast.error('Failed to upload image');
      }
    } catch (err) {
      toast.error('Error scanning receipt');
    } finally {
      setIsScanning(false);
      setPreview(null);
    }
  };

  return (
    <div className={styles.container}>
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className={styles.hiddenInput} 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {!preview ? (
        <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
          <LuCamera className={styles.icon} />
          <p>Tap to Scan Receipt</p>
          <span className={styles.subtext}>AI will extract the amount, date, and merchant</span>
        </div>
      ) : (
        <div className={styles.previewArea}>
          <img src={preview} alt="Receipt preview" className={styles.previewImage} />
          {isScanning && (
            <div className={styles.scanningOverlay}>
              <div className={styles.scannerLine}></div>
              <p>Analyzing...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
