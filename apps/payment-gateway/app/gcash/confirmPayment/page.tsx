"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Divider } from "@chakra-ui/react";
import { poppins } from "@/app/fonts";

export default function GCashConfirmPayment() {
  const r = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = () => {
    r.push(`/gcash/receipt?${searchParams.toString()}`);
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
      <div className="rounded-md card bg-base-100 shadow-md px-5 py-4 sm:px-10 sm:absolute sm:top-52 sm:py-8">
        <div>
          <h2 className="card-title justify-center text-gcash pb-8">
            <span>{searchParams.get("merchant")}</span>
          </h2>
          <div className="py-2">
            <p
              className={`${poppins.className} uppercase text-sm text-gcash font-bold`}
            >
              Pay With
            </p>
            <div className="grid grid-cols-6 gap-x-10 gap-y-5 p-4">
              <div className="col-span-2 flex flex-col">
                <span>GCash</span>
                <span className="text-gcash text-xs">Pay Now</span>
              </div>
              <div className="col-span-3 text-right flex flex-col">
                <span>PHP 5,459.00</span>
                <span className="text-xs">Available Balance</span>
              </div>
              <div className="col-span-1 flex items-center">
                <input
                  type="radio"
                  name="payment"
                  value="gcash"
                  className="radio accent-gcash"
                  checked
                />
              </div>
            </div>
          </div>
          <div className="py-2">
            <p
              className={`${poppins.className} uppercase text-sm text-gcash font-bold`}
            >
              You Are About To Pay
            </p>
            <div className="p-4">
              <div className="flex justify-between py-2">
                <span>Amount</span>
                <span>PHP {searchParams.get("amountDue")}</span>
              </div>
              <Divider />
              <div className="flex justify-between items-center py-2">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  PHP{" "}
                  <span className={`text-3xl  ${poppins.className}`}>
                    {searchParams.get("amountDue")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm">
          Please review to ensure that the details are correct before you
          proceed.
        </p>
        <div className="card-actions pt-4">
          <button
            className="btn bg-gcash text-white btn-block btn-circle"
            onClick={handleSubmit}
          >
            Pay PHP {searchParams.get("amountDue")}
          </button>
        </div>
      </div>
    </div>
  );
}
