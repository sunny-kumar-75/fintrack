import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LuCpu, LuCamera, LuMessageSquare } from 'react-icons/lu';
import { getInsights } from '../../services/aiService';
import AIChatBox from '../../components/widgets/AIChatBox';
import ReceiptScanner from '../../components/widgets/ReceiptScanner';
import AddTransaction from '../Transactions/AddTransaction';
import styles from './AIInsights.module.css';

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      // Check if insights are already cached in this session
      const cachedInsights = sessionStorage.getItem('ai_insights');
      if (cachedInsights) {
        setInsights(JSON.parse(cachedInsights));
        setLoadingInsights(false);
        return;
      }

      try {
        const res = await getInsights();
        if (res.success) {
          setInsights(res.insights);
          
          const isError = res.insights.some(i => 
            i.includes('overloaded') || 
            i.includes('quota') || 
            i.includes('limit') || 
            i.includes('unavailable')
          );
          
          if (!isError) {
            sessionStorage.setItem('ai_insights', JSON.stringify(res.insights));
          }
        }
      } catch (err) {
        toast.error('Failed to load AI insights');
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, []);

  const handleScanComplete = (data) => {
    setScannedData(data);
    setIsAddOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>FinTrack AI</h1>
      </div>

      <div className={styles.grid}>
        {}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <LuCpu className={styles.icon} />
              Monthly Insights
            </h3>
            {loadingInsights ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                <div className="loading-spinner" />
              </div>
            ) : insights.length > 0 ? (
              <ul className={styles.insightsList}>
                {insights.map((insight, idx) => (
                  <li key={idx} className={styles.insightItem}>
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>Not enough data to generate insights yet.</p>
            )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <LuCpu className={styles.icon} />
              Smart Receipt Scanner
            </h3>
            <ReceiptScanner onScanComplete={handleScanComplete} />
          </div>
        </div>

        {}
        <div className={styles.rightCol}>
          <div className={styles.card} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 className={styles.cardTitle}>
              <LuCpu className={styles.icon} />
              Chat with AI
            </h3>
            <p className={styles.chatDesc}>Ask questions about your spending patterns or get savings advice.</p>
            <div style={{ flex: 1, marginTop: '1rem' }}>
              <AIChatBox />
            </div>
          </div>
        </div>
      </div>

      <AddTransaction 
        isOpen={isAddOpen} 
        onClose={() => {
          setIsAddOpen(false);
          setScannedData(null);
        }}
        initialData={scannedData}
        onSave={() => {
          
        }}
      />
    </div>
  );
}
