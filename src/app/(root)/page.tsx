import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { navLinks } from "../../../constants";
import Link from "next/link";
import { Collection } from "@/components/shared/Collection";
import { getAllImages } from "@/lib/actions/image.actions";

export default async function  Home({searchParams}:SearchParamProps) {
  //for pagination we are getting the page and searchquery
  const page=Number(searchParams?.page)||1;
  const searchQuery=(searchParams?.query as string )||" "
  const images=await getAllImages({page ,searchQuery})
  return (
   <div> 
      {/* showing banner */}
    <section className="home">
      <h1 className="home-heading">
        Unleash your creativity 🚀 with ReTouchLab 🔮
      </h1>
      {/* all images */}
      <ul className=" flex-center w-full gap-20">
        {navLinks.slice(1,5).map((link)=>  
        <Link  className=" flex-col flex-center  gap-2"
        href={link.route}
        key={link.route}
        >
          <li className=" flex-center w-fit  rounded-full bg-white p-4 ">
          <Image
          src={link.icon}
          alt="link"
          width={24}
          height={24}
          />
          </li>
          <p className="p-14-medium  text-center text-white ">
            {link.label}
          </p>
       


        </Link>) }
      </ul>
    </section>
    <section className="sm:mt12">
      <Collection
      hasSearch={true}
      images={images?.data}
      page={page}
      totalPages={images?.toalPage}
      />
    </section>
    
   </div>
  );
}
 