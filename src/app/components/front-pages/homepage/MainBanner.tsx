import Image from "next/image";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MainBanner = () => {
  const userImg = [
    {
      user: "/images/profile/user-2.jpg",
    },
    {
      user: "/images/profile/user-3.jpg",
    },
    {
      user: "/images/profile/user-4.jpg",
    },
  ];

  const Technology = [
    {
      tech: "/images/front-pages/technology/react.svg",
      tooltip: "React",
    },

    {
      tech: "/images/front-pages/technology/nextjs.svg",
      tooltip: "Next.js",
    },
    {
      tech: "/images/front-pages/technology/typescript.svg",
      tooltip: "Typescript",
    },
    {
      tech: "/images/front-pages/technology/tailwind.svg",
      tooltip: "Tailwind css",
    },
    {
      tech: "/images/front-pages/technology/headless-ui.svg",
      tooltip: "Headless Ui",
    },
    {
      tech: "/images/front-pages/technology/shadcn.svg",
      tooltip: "Shadcn Ui",
    },
  ];
  return (
    <>
      <div className="bg-lightgray dark:bg-darkgray">
        <div className="container-1218 mx-auto sm:pt-10 !pt-6 xl:pb-0 pb-10">
          <div className="grid grid-cols-12 gap-7 items-center ">
            <div className="xl:col-span-6 col-span-12 lg:text-start text-center">
              <h1 className="lg:text-56 text-4xl text-dark dark:text-white font-bold lg:leading-[64px] leading-[50px]">
                A Trusted Way<b className="font-bold text-green-600"> to </b> <b className="block">Raise Funds</b> 
                <b className="text-green-600">Online | Hiilbox</b>
              </h1>
              <div className="sm:flex text-center mx-auto block items-center gap-3 lg:justify-start justify-center py-6">
                <div className="flex flex-row-reverse lg:justify-start justify-center ps-3">
                  {userImg.map((item, index) => (
                    <div className="-ms-3 h-10 w-10 relative z-5" key={index}>
                      <Image
                        src={item.user}
                        className="border-2 border-white dark:border-darkborder rounded-full"
                        alt="icon"
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                </div>
                <h5 className="text-base text-ld font-medium opacity-80 md:pt-0 pt-3">
                  52,589+ developers & agencies using our templates
                </h5>
              </div>
              <ul className="flex flex-wrap lg:justify-start justify-center gap-5 pb-7 md:pt-4 ml-0">
                <TooltipProvider delayDuration={100}>
                  {Technology.map((item, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <li
                          key={index}
                          className="md:h-14 md:w-14 h-10 w-10 bg-white dark:bg-darkmuted rounded-[16px] flex justify-center items-center shadow-elevation1 cursor-pointer"
                        >
                          <Image
                            src={item.tech}
                            alt="icon"
                            height={28}
                            width={28}
                            className="md:h-7 h-5"
                          />
                        </li>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        {item.tooltip}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </ul>
              <div className="flex lg:justify-start justify-center">
                <Button
                  className=" font-bold sm:w-fit w-full rounded-full"
                  size="lg"
                >
                  <Link href="/auth/auth2/login">Log in</Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12 xl:block hidden">
              <div className="min-w-[1300px] max-h-[700px] h-[calc(100vh_-_100px)] overflow-hidden ">
                <Image
                  src="/images/front-pages/background/main-banner.webp"
                  className="rtl:scale-x-[-1]"
                  alt="banner"
                  width={1144}
                  height={710}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainBanner;
