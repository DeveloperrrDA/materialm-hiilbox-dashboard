import Image from "next/image";

const companies = [
  {
    img: "/images/front-pages/componies/intel.svg",
  },
  {
    img: "/images/front-pages/componies/oracle.svg",
  },
  {
    img: "/images/front-pages/componies/dell.svg",
  },
  {
    img: "/images/front-pages/componies/samsung.svg",
  },
  {
    img: "/images/front-pages/componies/infosys.svg",
  },
  {
    img: "/images/front-pages/componies/capgemini.svg",
  },
];
const Companies = () => {
  return (
    <>
      <div className="dark:bg-dark">
        <div className="container-1218 mx-auto ">
          <div className="border-ld border-t lg:pt-14 pt-7">
            <div className="flex flex-wrap md:justify-between justify-center  items-center gap-4">
              {companies.map((item, index) => (
                <div key={index} className="">
                  <Image
                    src={item.img}
                    alt="company"
                    width={140}
                    height={20}
                    className="h-fit w-fit"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Companies;
