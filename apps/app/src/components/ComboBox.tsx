import { chevronDown, chevronUp } from "ionicons/icons";
import { useButton, useComboBox, useFilter } from "react-aria";

import type { ComboBoxProps } from "@react-types/combobox";
import { IonIcon } from "@ionic/react";
import { ListBox } from "./ListBox";
import { Popover } from "./Popover";
import { useComboBoxState } from "react-stately";
import { useRef } from "react";

export { Item, Section } from "react-stately";

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let buttonRef = useRef(null);
  let inputRef = useRef(null);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);

  let {
    buttonProps: triggerProps,
    inputProps,
    listBoxProps,
    labelProps,
  } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  let { buttonProps } = useButton(triggerProps, buttonRef);

  return (
    <div className="flex flex-col relative">
      <label
        {...labelProps}
        className="block text-sm font-medium text-gray-700 text-left mt-2 mb-2"
      >
        {props.label}
      </label>
      <div
        className={`relative flex flex-row rounded-md overflow-hidden shadow-sm border-2 ${
          state.isFocused ? "border-pink-500" : "border-gray-300"
        }`}
      >
        <input
          {...inputProps}
          ref={inputRef}
          className={`outline-none px-4 py-2 w-full`}
        />
        <button
          {...buttonProps}
          ref={buttonRef}
          className={`px-2 bg-gray-100 cursor-default border-l-2 ${
            state.isFocused
              ? "border-pink-500 text-pink-600"
              : "border-gray-300 text-gray-500"
          }`}
        >
          <IonIcon
            icon={state.isOpen ? chevronDown : chevronUp}
            className="w-5 h-5"
            aria-hidden="true"
          />
        </button>
      </div>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          triggerRef={inputRef}
          state={state}
          isNonModal
          placement="bottom start"
          className="w-52"
        >
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </div>
  );
}
