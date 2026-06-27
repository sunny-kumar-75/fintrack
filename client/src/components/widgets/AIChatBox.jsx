import { useState, useRef, useEffect } from 'react';
import { LuSend, LuUser, LuCpu } from 'react-icons/lu';
import { chatWithAI } from "../../services/aiService";
import styles from './AIChatBox.module.css';

export default function AIChatBox() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: 'Hi there! Ask me anything about your spending, trends, or savings tips.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatWithAI(userMsg.content);
      if (res.success) {
        setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: res.reply }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: 'Sorry, I encountered an error.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: 'Sorry, could not connect to AI service.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.user : styles.ai}`}>
            <div className={styles.bubble}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.ai}`}>
            <div className={styles.typingIndicator}>
              <span /> <span /> <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputArea} onSubmit={handleSend}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ask me about your finances..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isLoading}>
          <LuSend />
        </button>
      </form>
    </div>
  );
}
