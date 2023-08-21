"use client";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  HStack,
  PinInput,
  PinInputField,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import useOTP from "@/lib/hooks/OTP";

export default function GCashOTP() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  const r = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get("mobile");

  const [otpInput, setOTPInput] = useState<string>("");
  const { status, setStatus, otp, handleResend, handleCopy } = useOTP(
    onOpen,
    onClose
  );

  const onSubmit = () => {
    if (otpInput !== otp) {
      setStatus("invalidOTP");
      return;
    } else {
      r.push(`/gcash/pin?${searchParams.toString()}`);
      setStatus("idle");
    }
  };

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset="slideInBottom"
        isCentered
      >
        <AlertDialogOverlay className="p-4">
          <AlertDialogContent>
            <AlertDialogHeader>New Message</AlertDialogHeader>
            <AlertDialogBody>
              <span className="underline">{otp}</span> is your authentication
              code. For your protection, do not share this code with anyone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Dismiss
              </Button>
              <Button onClick={() => handleCopy()}>Copy</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <div className="h-screen flex flex-col items-center">
        <div>
          <img
            src="/gcash/logo.png"
            alt="GCash Logo"
            className="sm:mt-20 my-12 h-14"
          />
        </div>
        <div className="rounded-md card bg-base-100 shadow-md px-5 sm:px-10 sm:absolute sm:top-52 py-4 sm:py-8">
          <div className="sm:py-4">
            <h2 className="card-title pb-2">Login to pay with GCash</h2>
            <p className="max-w-xs">
              Great! We sent a 6-digit authentication code to your number{" "}
              {mobile}
            </p>
            <HStack className="py-4">
              <PinInput
                onChange={(value) => setOTPInput(value)}
                otp
                variant="flushed"
                value={otpInput}
              >
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
              </PinInput>
            </HStack>
            <div className='text-center'>
              {status === "idle" && <span>Didn't received the code?</span>}
              {status === "sending" && (
                <span>Please wait a few seconds before resending</span>
              )}
              {status === "invalidOTP" && (
                <span className="text-red-500">
                  Invalid OTP. Please try again.
                </span>
              )}
              {status !== "sending" && (
                <>
                  <span> </span>
                  <span
                    className="underline cursor-pointer text-gcash"
                    onClick={() => handleResend()}
                  >
                    Resend
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="card-actions pt-4">
            <button
              className={`btn bg-gcash text-white btn-block btn-circle ${
                otpInput.length !== 6 ? "btn-disabled" : ""
              }`}
              onClick={onSubmit}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
