import PropTypes from "prop-types";
import { Fragment, useMemo, useState } from "react";
import {
  Dialog,
  Listbox,
  Transition,
  TransitionChild,
  DialogTitle,
  DialogPanel,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { BsCheckLg } from "react-icons/bs";
import { AiOutlineDown } from "react-icons/ai";
import { FaUserShield, FaUserTie, FaUser } from "react-icons/fa";

const ROLES = ["user", "seller", "admin"];

const roleMeta = {
  user: {
    label: "User",
    icon: FaUser,
    badge: "bg-gray-100 text-gray-700",
    dot: "bg-gray-400",
  },
  seller: {
    label: "Seller",
    icon: FaUserTie,
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  admin: {
    label: "Admin",
    icon: FaUserShield,
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
  },
};

const UpdateUserModal = ({ setIsOpen, isOpen, modalHandler, user }) => {
  const [selected, setSelected] = useState(user.role || "user");
  const SelectedIcon = useMemo(
    () => roleMeta[selected]?.icon ?? FaUser,
    [selected]
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex border min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-3 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-[0.98]"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-8 text-left align-middle shadow-2xl backdrop-blur-md transition-all min-h-[420px] sm:min-h-[460px] flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow">
                    <SelectedIcon className="text-xl" />
                  </div>
                  <div>
                    <DialogTitle
                      as="h3"
                      className="text-xl font-semibold text-gray-800"
                    >
                      Update User Role
                    </DialogTitle>
                    <p className="text-xs text-gray-500">
                      Change the role for{" "}
                      <span className="font-medium text-gray-700">
                        {user?.email}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Current role badge */}
                <div className="mt-4">
                  <h5
                    className={`flex justify-center items-center gap-2 text-xs font-medium px-3 py-1 rounded-full ${roleMeta[selected]?.badge}`}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${roleMeta[selected]?.dot}`}
                    />
                    Current: {roleMeta[selected]?.label}
                  </h5>
                </div>

                {/* Role Selector */}
                <div className="mt-5">
                  <Listbox value={selected} onChange={setSelected}>
                    <div className="relative">
                      <ListboxButton className="relative w-full cursor-pointer rounded-xl bg-white/90 py-3 pl-4 pr-10 text-left shadow-md outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500">
                        <span className="flex items-center gap-2">
                          {SelectedIcon && (
                            <SelectedIcon className="text-gray-600" />
                          )}
                          <span className="block truncate capitalize">
                            {selected}
                          </span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <AiOutlineDown
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </ListboxButton>

                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <ListboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-2 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none">
                          {ROLES.map((role) => {
                            const Icon = roleMeta[role]?.icon ?? FaUser;
                            return (
                              <ListboxOption
                                key={role}
                                className="relative cursor-pointer select-none px-4 py-2 data-[focus]:bg-blue-50 data-[focus]:text-blue-900"
                                value={role}
                              >
                                {({ selected }) => (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <Icon className="text-gray-600" />
                                      <span
                                        className={`block truncate capitalize ${
                                          selected
                                            ? "font-semibold"
                                            : "font-normal"
                                        }`}
                                      >
                                        {role}
                                      </span>
                                    </div>
                                    {selected ? (
                                      <span className="absolute inset-y-0 right-3 flex items-center text-blue-600">
                                        <BsCheckLg
                                          className="h-4 w-4"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </ListboxOption>
                            );
                          })}
                        </ListboxOptions>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                {/* Actions */}
                <div className="mt-7 flex items-center justify-center gap-3">
                  <button
                    onClick={() => modalHandler(selected, user?.email)}
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

UpdateUserModal.propTypes = {
  user: PropTypes.object,
  modalHandler: PropTypes.func,
  setIsOpen: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default UpdateUserModal;
