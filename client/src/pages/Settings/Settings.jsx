import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuUser, LuDollarSign, LuBell, LuDownload, LuTrash2, LuLock } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import {
  updateProfile, 
  exportCSV, 
  deleteAccount 
} from '../../services/settingsService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { changePassword } from '../../services/authService';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, login } = useAuth(); 
  
  const [name, setName] = useState(user?.username || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ name });
      if (res.success) {
        toast.success('Profile updated');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      return toast.error('New passwords do not match');
    }
    try {
      
      const res = await changePassword(null, currentPassword, newPassword); 
      if (res.success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };


  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      await exportCSV();
      toast.success('Export downloaded!', { id: 'export' });
    } catch (err) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.prompt('Type "DELETE" to permanently delete your account and all data') === 'DELETE') {
      try {
        await deleteAccount();
        window.location.href = '/login';
      } catch (err) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences and data</p>
      </div>

      <div className={styles.grid}>
        {}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <LuUser className={styles.icon} />
            <h2>Profile</h2>
          </div>
          <form className={styles.card} onSubmit={handleUpdateProfile}>
            <div className={styles.formGrid}>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<LuUser />}
              />
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  icon={<LuBell />}
                />
                <small className={styles.helpText} style={{ display: 'block', marginTop: '0.25rem' }}>Email cannot be changed</small>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary">Save Profile</Button>
            </div>
          </form>
        </section>

        {}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <LuLock className={styles.icon} />
            <h2>Security</h2>
          </div>
          <form className={styles.card} onSubmit={handleChangePassword}>
            <div className={styles.formGrid}>
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                showPasswordToggle
                required
              />
              <div></div> {}
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                showPasswordToggle
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                showPasswordToggle
                required
              />
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary">Update Password</Button>
            </div>
          </form>
        </section>

        {}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <LuDownload className={styles.icon} />
            <h2>Data & Export</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.row}>
              <div>
                <h4>Export Transactions</h4>
                <p className={styles.helpText}>Download all your data as a CSV file</p>
              </div>
              <Button variant="secondary" onClick={handleExport}>
                Export CSV
              </Button>
            </div>
          </div>
        </section>

        {}
        <section className={`${styles.section} ${styles.dangerZone}`}>
          <div className={styles.sectionHeader}>
            <LuTrash2 className={styles.dangerIcon} />
            <h2 className={styles.dangerText}>Danger Zone</h2>
          </div>
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <div className={styles.row}>
              <div>
                <h4>Delete Account</h4>
                <p className={styles.helpText}>Permanently delete your account and all financial data. This cannot be undone.</p>
              </div>
              <Button style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} variant="primary" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
