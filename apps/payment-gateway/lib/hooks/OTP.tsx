import { useEffect, useState } from "react";

import { generateOTP } from "../utils";
import { useCopyToClipboard } from "usehooks-ts";

/**
 * Custom hook that generates and manages OTP (One-Time Password) functionality.
 * @param onSendCallback - Optional callback function to be executed when OTP is sent.
 * @param onCopyCallback - Optional callback function to be executed when OTP is copied.
 * @param limit - Optional limit for the number of digits in the OTP. Defaults to 6.
 * @returns An object containing the current status of the OTP, the OTP value, and functions to resend and copy the OTP.
 */
export default function useOTP(
  onSendCallback?: () => void,
  onCopyCallback?: () => void,
  limit?: number
) {
  const [value, copy] = useCopyToClipboard();
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "invalidOTP"
  >("idle");
  const [otp, setOTP] = useState(() => generateOTP(limit ?? 6));
  const handleResend = () => {
    setStatus("sending");
    setTimeout(() => {
      console.log("Resend OTP");
      setOTP(generateOTP(6));
      setStatus("sent");
      if (onSendCallback) onSendCallback();
      setStatus("idle");
    }, Math.random() * 10000);
  };
  const handleCopy = () => {
    console.log("Copy OTP: ", otp);
    copy(otp);
    if (onCopyCallback) onCopyCallback();
  };

  useEffect(() => {
    handleResend();
  }, []);

  return {
    status,
    setStatus,
    otp,
    handleResend,
    handleCopy,
  };
}

useOTP.defaultProps = {
  limit: 6,
};
