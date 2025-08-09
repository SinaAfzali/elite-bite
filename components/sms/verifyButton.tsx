"use client";

import React from 'react';
import styles from '@/components/sms/styles/OneTimeCodeInput.module.css';

interface VerifyButtonProps {
    handleVerify: () => void;
    disabled: boolean;
}

const VerifyButton: React.FC<VerifyButtonProps> = ({ handleVerify, disabled }) => {
    return (
        <button
            type="submit"
            className={styles.button}
            onClick={handleVerify}
            disabled={disabled}
        >
            {disabled ? 'در حال تأیید...' : 'تأیید'}
        </button>
    );
};

export default VerifyButton;