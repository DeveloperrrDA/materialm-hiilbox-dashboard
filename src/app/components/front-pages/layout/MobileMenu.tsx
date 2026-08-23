"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { IconMenu2 } from "@tabler/icons-react";
import Link from "next/link";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import Navigation from "./Navigation";
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);
  return (
    <>
      <div className="xl:hidden flex ">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center text-dark  h-10 w-10 rounded-full bg-transparent hover:bg-lightprimary"
            >
              <IconMenu2 />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className=" overflow-y-scroll w-[280px] sm:w-[320px] h-full  bg-white dark:bg-darkgray p-6 flex flex-col justify-between"
          >
            <SheetHeader className="mb-2">
              <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation drawer for mobile devices
              </SheetDescription>
              <FullLogo />
            </SheetHeader>

            <div className="flex flex-col gap-4">
              <Navigation />
            </div>

            <SheetFooter className="p-0 mt-6">
              <SheetClose asChild>
                <Button asChild className="font-bold w-full mt-6">
                  <Link href="/auth/auth2/login">Log in</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileMenu;
