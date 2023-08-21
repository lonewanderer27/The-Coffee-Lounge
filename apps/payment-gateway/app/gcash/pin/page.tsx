"use client";

import { HStack, PinInput, PinInputField } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";

import { useState } from "react";

export default function GCashPin() {
  const [pin, setPin] = useState<string>("");

  const r = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = () => {
    r.push(`/gcash/confirmPayment?${searchParams.toString()}`);
  };

  return (
    <div className="h-screen flex flex-col items-center">
      <div>
        <img
          src="/gcash/logo.png"
          alt="GCash Logo"
          className="sm:mt-20 my-12 h-14"
        />
      </div>
      <div className="rounded-md card bg-base-100 shadow-md px-10 sm:absolute sm:top-52 py-4 sm:py-8">
        <div className="sm:py-4">
          <h2 className="card-title pb-2">Login to pay with GCash</h2>
          <p className="max-w-xs">Enter your 4-digit MPin</p>
          <HStack className="py-4">
            <PinInput
              mask
              onChange={(e) => setPin(e)}
              value={pin}
              variant="flushed"
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
        </div>
        <div className="card-actions pt-4" onClick={handleSubmit}>
          <button
            className={`btn bg-gcash text-white btn-block btn-circle ${
              pin.length != 4 ? "btn-disabled" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
