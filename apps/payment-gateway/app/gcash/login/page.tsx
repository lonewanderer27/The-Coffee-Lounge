"use client";

import { FieldValues, Resolver, useForm } from "react-hook-form";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";

import { poppins } from "@/app/fonts";

type FormValues = {
  mobileNumber: number;
};

const pattern: RegExp = /^(9|\+639)\d{9}$/;

export default function GCashLogin() {
  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<FormValues>();

  const r = useRouter();
  const searchParams = useSearchParams();
  const merchant = searchParams.get("merchant");
  const amountDue = searchParams.get("amountDue");

  const onSubmit = (values: FieldValues) => {
    console.log(values);
    r.push(
      `/gcash/otp?${searchParams.toString()}&mobile=0${values.mobileNumber}`
    );
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
      <div className="rounded-md card bg-base-100 shadow-md px-5 sm:px-10 sm:absolute sm:top-52 py-4 sm:py-8">
        <div className="grid grid-cols-5 sm:py-4 gap-x-10 gap-y-5 text-gcash-label text-md sm:text-lg">
          <div className="col-span-2">
            <h4>Merchant</h4>
          </div>
          <div className="col-span-3">
            <h4>{merchant}</h4>
          </div>
          <div className="col-span-2">
            <h4>Amount Due</h4>
          </div>
          <div className="col-span-3">
            <h4 className="text-gcash">PHP {amountDue}</h4>
          </div>
        </div>
        <div className="py-4">
          <h2 className={`card-title ${poppins.className}`}>
            Login to pay with GCash
          </h2>
          <FormControl
            isRequired
            variant="floating"
            id="mobile-number"
            className="my-5"
            isInvalid={!isValid}
          >
            <FormLabel>Mobile Number</FormLabel>
            <InputGroup>
              <InputLeftAddon children="+63" />
              <Input
                type="tel"
                {...register("mobileNumber", {
                  required: true,
                  pattern: pattern,
                  maxLength: 10,
                })}
              />
            </InputGroup>
            <FormHelperText>Please enter your mobile number</FormHelperText>
          </FormControl>
        </div>
        <div className="card-actions pt-4">
          <button
            className={`btn bg-gcash text-white btn-block btn-circle ${
              !isValid ? "btn-disabled" : ""
            }`}
            type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
