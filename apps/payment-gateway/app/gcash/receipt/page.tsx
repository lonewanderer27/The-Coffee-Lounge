"use client";

import { Divider, Spinner } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";

import { useEffect } from "react";

export default function Receipt() {
  const r = useRouter();
  const searchParams = useSearchParams();
  const merchant = searchParams.get("merchant");
  const amountDue = searchParams.get("amountDue");
  const referenceNo = searchParams.get("referenceNo");
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (callbackUrl) {
        r.push(callbackUrl);
      }
    }, 3000)

    return () => clearTimeout(timer);
  })

  return (
    <div className="h-screen flex flex-col items-center">
      <div>
        <img src="/gcash/logo.png" alt="GCash Logo" className="mt-20 h-14" />
      </div>
      <div className="rounded-md card bg-base-100 shadow-md px-5 sm:px-10 absolute top-52 py-8 max-[430px]:w-full sm:w-[400px]">
        <span className="sm:py-4">
          <div className="flex justify-between py-1">
            <h2 className="card-title pb-2 text-gcash">{merchant}</h2>
            <ion-icon
              name="checkmark-circle"
              size="large"
              class="text-gcash font-bold"
            ></ion-icon>
          </div>
          <span className="text-sm font-fold">Paid and linked via GCash</span>
          <Divider />
          <div className="flex justify-between text-gcash-label py-1">
            <span>Amount</span>
            <span>{amountDue}</span>
          </div>
          <Divider />
          <div className="flex justify-between font-bold py-1">
            <span>Total</span>
            <span>₱ {amountDue}</span>
          </div>
          {callbackUrl && (
            <>
              <div className="flex justify-between py-3 mt-3">
                <span className="text-sm">
                  Redirecting you back to merchant
                </span>
                <Spinner
                  size="md"
                  thickness="3px"
                  speed="1s"
                  className="text-gcash ml-3"
                />
              </div>
              <button
                className={`btn bg-gcash text-white btn-block btn-circle my-3`}
              >
                Proceed
              </button>
            </>
          )}
          <div className="flex justify-between text-gcash-label mt-5">
            <span>Date</span>
            <span>
              {new Date().toDateString()} {new Date().getHours()}:
              {new Date().getMinutes()}{" "}
              {new Date().getTime() > 12 ? "PM" : "AM"}
            </span>
          </div>
          <div className="flex justify-between text-gcash-label">
            <span>Reference No.</span>
            <span>{referenceNo}</span>
          </div>
        </span>
      </div>
    </div>
  );
}
