import Image from "next/image";

const companies = [
  {
    img: "https://cdn.hiilbox.com/2026/06/Kaash-Plus-Payment-Method.webp",
    key: "paymentMethod1",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Sahal-Payment-Method.webp",
    key: "paymentMethod2",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/My-Cash-Payment-Method.webp",
    key: "paymentMethod3",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Premier-Wallet-Payment-Method.webp",
    key: "paymentMethod4",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Apple-Pay-Payment-Method.webp",
    key: "paymentMethod15",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Google-Pay-Payment-Method.webp",
    key: "paymentMethod6",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/MasterCard-Payment-Method.webp",
    key: "paymentMethod7",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Visa-Payment-Method.webp",
    key: "paymentMethod8",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Zaad-Payment-Method.webp",
    key: "paymentMethod9",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/eDahab-Payment-Method.webp",
    key: "paymentMethod10",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/EVC-Plus-Payment-Method.webp",
    key: "paymentMethod11",
  },
  {
    img: "https://cdn.hiilbox.com/2026/06/Jeeb-Payment-Method.webp",
    key: "paymentMethod12",
  },
];
const Companies = () => {
  return (
    <>
      <div className="dark:bg-dark">
        <div className="container-full mx-auto ">
          <div className="border-ld border-t lg:py-14 py-7 marquee1-group flex gap-6">
            {[0].map((item,index) => {
                return (
                <div key={index} className="flex md:justify-between justify-center  items-center gap-4">
                  {companies.map((item) => (
                    <div key={item.key} className="">
                      <Image
                        src={item.img}
                        alt="company"
                        width={190}
                        height={100}
                        className="h-auto w-auto"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Companies;
